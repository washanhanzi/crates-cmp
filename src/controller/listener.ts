import { ExtensionContext, window, TextDocument, TextEditor, DiagnosticCollection, Diagnostic, Uri, DiagnosticSeverity } from "vscode"
import { DependenciesTraverser, NodeStore, symbolTree } from "./symbolTree"
import { dependenciesDecorations } from "@/usecase"
import { DependencyDecorationStatus, DependencyDecoration, DependencyItemType, DependencyDecorationWithCtx, Ctx } from "@/entity"
import { DecorationStore, latestDecoration, loadingDecoration, notInstalledDecoration, outdatedDecoration } from "./decoration"
import { cargoTree } from "./cargo"
import { async } from "@washanhanzi/result-enum"
import { dependenciesDiagnostics } from "@/usecase"
import { DiagnosticStore } from "./diagnostic"
import { PromiseCache } from "@/util/promiseCache"

const cargoTreeCommandCache = new PromiseCache()

export class Listener {
	private ctx: ExtensionContext
	//track the decoration state
	private decorationStore = new DecorationStore()
	//track toml nodes
	private nodeStore = new NodeStore()
	private diagnosticStore = new DiagnosticStore()

	constructor(ctx: ExtensionContext) {
		this.ctx = ctx
	}

	async onChange(document: TextDocument) {
		const documentVersion = document.version

		const tree = await symbolTree(document.uri)
		if (tree.length === 0) {
			return
		}
		//resume point, check
		if (this.nodeStore.skip(document.uri.path)) {
			return
		}
		//document has been updated
		if (document.version !== documentVersion) {
			return
		}

		const ctx = {
			extensionContext: this.ctx,
			path: document.uri.path,
			rev: this.nodeStore.incRev(),
			uri: document.uri
		}

		const walker = new DependenciesTraverser(tree, document, this.nodeStore, ctx.rev)
		walker.walk()
		this.nodeStore.finishWalk()

		//clear decorations for deleted nodes
		this.clearDecoration(this.nodeStore.deletedIds())

		//updated range

		//tree is clean
		if (this.nodeStore.isClean()) {
			return
		}

		//set dirty nodes to waiting decoration
		this.setWaitingNodes(this.nodeStore.dirtyIds())

		await this.patchNodeStore(ctx)
	}

	outputPromiseHandler(output: DependencyDecorationWithCtx) {
		if (this.nodeStore.checkAndDelDirty(output.decoration.id, output.ctx.rev)) {
			this.decorate(output.decoration.id, output.decoration)
		}
	}

	setWaitingNodes(ids: string[]) {
		for (let id of ids) {
			//add loading decoration
			this.decorate(id, { id: id, current: "", currentMax: "", latest: "", status: DependencyDecorationStatus.LOADING })
		}
	}

	clearDecoration(ids: string[]) {
		if (ids.length === 0) return
		for (let id of ids) {
			//clear decorations state
			this.decorationStore.delete(id)
		}
	}

	//decoration return an old decoration or new onee
	decorate(id: string, deco: DependencyDecoration) {
		const d = this.decorationStore.get(id)
		if (d) {
			if (d.latest === deco.latest && d.status === deco.status) {
				//decorate
				if (this.nodeStore.range(id)) {
					window.activeTextEditor?.setDecorations(d.decoration, [this.nodeStore.range(id)!])
				}
				return d.decoration
			} else {
				d.decoration.dispose()
			}
		}
		let dt
		switch (deco.status) {
			case DependencyDecorationStatus.LATEST:
				dt = latestDecoration(deco.latest)
				break
			case DependencyDecorationStatus.OUTDATED:
				dt = outdatedDecoration(deco)
				break
			case DependencyDecorationStatus.LOADING:
				dt = loadingDecoration()
				break
			case DependencyDecorationStatus.NOT_INSTALLED:
				dt = notInstalledDecoration()
				break
		}
		this.decorationStore.set(id, { latest: deco.latest, status: deco.status, decoration: dt })
		if (this.nodeStore.range(id)) {
			window.activeTextEditor?.setDecorations(dt, [this.nodeStore.range(id)!])
		}
	}

	async onDidSaveTextDocument(document: TextDocument) {
		if (
			document.fileName.endsWith("Cargo.toml")
		) {
			if (this.nodeStore.path === document.uri.path && this.nodeStore.documentVersion === document.version) return
			this.init(document)
			await this.onChange(document)
		}
	}

	async onDidChangeActiveEditor(editor: TextEditor | undefined) {
		if (!editor) return
		if (!editor.document.fileName.endsWith("Cargo.toml")) {
			this.nodeStore.reset()
			return
		}
		this.init(editor.document)
		await this.onChange(editor.document)
	}

	async onDidLockFileChange() {
		if (!window.activeTextEditor) return
		if (!window.activeTextEditor.document.fileName.endsWith("Cargo.toml")) return
		if (!this.nodeStore.path) return

		const ctx = {
			extensionContext: this.ctx,
			path: window.activeTextEditor.document.uri.path,
			rev: this.nodeStore.incRev(),
			uri: window.activeTextEditor.document.uri
		}
		await this.patchNodeStore(ctx)
	}

	onDidCloseTextDocument(document: TextDocument) {
		if (!document.fileName.endsWith("Cargo.toml")) return
		if (this.nodeStore.skip(document.uri.path)) return
		this.nodeStore.reset()
	}

	init(doc: TextDocument) {
		this.nodeStore.init(doc.uri.path, doc.version)
		this.decorationStore.init(doc.uri.path)
	}

	reset() {
		this.nodeStore.reset()
		this.decorationStore.reset()
	}

	async patchNodeStore(ctx: Ctx) {
		//suspend
		const currentDepsResult = await async(cargoTreeCommandCache.call(ctx.path, cargoTree, ctx.path))
		if (currentDepsResult.isErr()) {
			//resume point, check
			if (this.nodeStore.isClean()) { return }

			//parse for diagnostic
			const filtered = this.nodeStore.dependencies.filter(d => this.nodeStore.isDirty(d.id, ctx.rev))

			//suspend
			const diagnostics = await dependenciesDiagnostics(ctx, filtered)
			//resume point, check
			if (diagnostics.length === 0) { return }

			let clear: string[] = []
			diagnostics
				.filter(d => this.nodeStore.checkAndDelDirty(d.diagnostic.id, d.ctx.rev))
				.forEach(d => {
					clear.push(d.diagnostic.id)
					this.diagnosticStore.addRaw(d.ctx.path, this.nodeStore.range(d.diagnostic.id)!, d.diagnostic)
				})
			//clear decorations for diagnostics
			this.clearDecoration(clear)
			this.diagnosticStore.set(ctx.uri)
			return
		}
		//resume check
		if (!window.activeTextEditor) return
		if (!window.activeTextEditor.document.fileName.endsWith("Cargo.toml")) return
		if (this.nodeStore.skip(ctx.path)) return

		//cargo command exit with 0, remove error diagnostics
		this.diagnosticStore.clearSeverity(ctx.uri, DiagnosticSeverity.Error)

		//populate dependencies with current version
		//find crates with different versions
		let duplicated: Set<string> = new Set()
		let found: { [key: string]: { versions: Set<string>, ids: string[] } } = {}
		let taints: string[] = []

		const currentDepts = currentDepsResult.unwrap()!

		for (let dep of this.nodeStore.dependencies) {
			if (currentDepts[dep.tableName]) {
				const deps = currentDepts[dep.tableName]
				const crateName = dep.packageName ?? dep.name
				if (deps[crateName]) {
					if (dep.currentVersion !== undefined && dep.currentVersion !== deps[crateName].version) {
						this.nodeStore.taint(dep.id, ctx.rev)
						taints.push(dep.id)
					}
					dep.currentVersion = deps[crateName].version

					//find duplicate crates
					if (found[crateName]) {
						found[crateName].versions.add(dep.currentVersion!)
						found[crateName].ids.push(dep.id)
						if (found[crateName].versions.size > 1) {
							duplicated.add(crateName)
						}
					} else {
						found[crateName] = { versions: new Set([dep.currentVersion!]), ids: [dep.id] }
					}
					continue
				}
			}
		}

		if (duplicated.size !== 0) {
			this.diagnosticStore.clear(ctx.uri)
			for (let crate of duplicated) {
				const message = "Found multiple versions: " + Array.from(found[crate].versions).join(", ")
				const diags = found[crate].ids.map(id => new Diagnostic(this.nodeStore.range(id)!, message, DiagnosticSeverity.Information))
				this.diagnosticStore.add(ctx.path, ...diags)
			}
			this.diagnosticStore.set(ctx.uri)
		} else {
			this.diagnosticStore.clearSeverity(ctx.uri, DiagnosticSeverity.Information)
		}

		if (taints.length !== 0) {
			this.setWaitingNodes(taints)
		}

		if (this.nodeStore.isClean()) return

		let promises = dependenciesDecorations(ctx, this.nodeStore.dependencies)

		promises.forEach(p => p.then(this.outputPromiseHandler.bind(this)))
	}
}