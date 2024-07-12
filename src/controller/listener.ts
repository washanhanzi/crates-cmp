import { ExtensionContext, window, TextDocument, TextEditor, DiagnosticCollection, Diagnostic, Uri, DiagnosticSeverity } from "vscode"
import { DependenciesTraverser, NodeStore, symbolTree } from "./symbolTree"
import { dependenciesDecorations } from "@/usecase"
import { DependencyDecorationStatus, DependencyDecoration, DependencyItemType, DependencyDecorationWithCtx } from "@/entity"
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
		const ctx = {
			extensionContext: this.ctx,
			path: document.uri.path,
			version: document.version,
			uri: document.uri
		}

		const tree = await symbolTree(document.uri)
		if (tree.length === 0) {
			return
		}
		//resume point, check
		if (this.nodeStore.skip(document.uri.path)) {
			return
		}

		const walker = new DependenciesTraverser(tree, document, this.nodeStore, ctx.version)
		walker.walk()
		this.nodeStore.finishWalk()

		//clear decorations for deleted nodes
		this.clearDecoration(this.nodeStore.deletedIds())

		//tree is clean
		if (this.nodeStore.isClean()) {
			return
		}

		//set dirty nodes to waiting decoration
		this.setWaitingNodes(this.nodeStore.dirtyIds())

		//suspend
		const currentDepsResult = await async(cargoTreeCommandCache.call(ctx.path, cargoTree, ctx.path))
		if (currentDepsResult.isErr()) {
			//resume point, check
			if (this.nodeStore.isClean()) { return }

			//parse for diagnostic
			const filtered = this.nodeStore.dependencies.filter(d => this.nodeStore.isDirty(d.id, ctx.version))

			//suspend
			const diagnostics = await dependenciesDiagnostics(ctx, filtered)
			//resume point, check
			if (diagnostics.length === 0) { return }

			let clear: string[] = []
			diagnostics
				.filter(d => this.nodeStore.checkAndDelDirty(d.diagnostic.id, d.ctx.version))
				.forEach(d => {
					clear.push(d.diagnostic.id)
					this.diagnosticStore.addRaw(d.ctx.path, this.nodeStore.range(d.diagnostic.id)!, d.diagnostic)
				})
			//clear decorations for diagnostics
			this.clearDecoration(clear)
			this.diagnosticStore.set(ctx.uri)
			return
		}

		//cargo command exit with 0, remove error diagnostics
		this.diagnosticStore.clearSeverity(ctx.uri, DiagnosticSeverity.Error)

		//resume point, check
		if (this.nodeStore.isClean()) {
			return
		}

		//populate dependencies with current version
		//find duplicated crates but with different versions
		let duplicated: Set<string> = new Set()
		let found: { [key: string]: { versions: Set<string>, ids: string[] } } = {}
		const currentDepts = currentDepsResult.unwrap()!
		for (let dep of this.nodeStore.dependencies) {
			if (currentDepts[dep.tableName]) {
				const deps = currentDepts[dep.tableName]
				const crateName = dep.packageName ?? dep.name
				if (deps[crateName]) {
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
			for (let crate of duplicated) {
				const message = "Found multiple versions: " + Array.from(found[crate].versions).join(", ")
				const diags = found[crate].ids.map(id => new Diagnostic(this.nodeStore.range(id)!, message, DiagnosticSeverity.Information))
				this.diagnosticStore.add(ctx.path, ...diags)
			}
			this.diagnosticStore.set(ctx.uri)
		}

		let promises = dependenciesDecorations(ctx, this.nodeStore.dependencies)

		promises.forEach(p => p.then(this.outputPromiseHandler.bind(this)))
	}

	outputPromiseHandler(output: DependencyDecorationWithCtx) {
		if (this.nodeStore.checkAndDelDirty(output.decoration.id, output.ctx.version)) {
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

	async onDidChangeTextDocument(document: TextDocument) {
		if (
			document.fileName.endsWith("Cargo.toml")
		) {
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
		// this.nodeStore.reset()
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
			version: window.activeTextEditor.document.version,
			uri: window.activeTextEditor.document.uri
		}

		const currentDepsResult = await async(cargoTreeCommandCache.call(this.nodeStore.path, cargoTree, this.nodeStore.path))
		if (currentDepsResult.isErr()) {
			return
		}
		//resume check
		if (!window.activeTextEditor) return
		if (!window.activeTextEditor.document.fileName.endsWith("Cargo.toml")) return
		if (!this.nodeStore.path) return
		if (this.nodeStore.skip(ctx.path)) return
		if (this.nodeStore.version !== ctx.version) return

		const currentDeps = currentDepsResult.unwrap()!
		let taints: string[] = []
		for (let dep of this.nodeStore.dependencies) {
			if (currentDeps[dep.tableName]) {
				const deps = currentDeps[dep.tableName]
				const crateName = dep.packageName ?? dep.name
				if (deps[crateName]) {
					if (dep.currentVersion !== deps[crateName].version) {
						dep.currentVersion = deps[crateName].version
						//the node is ditry
						this.nodeStore.taint(dep.id)
						taints.push(dep.id)
					}
				}
			}
		}
		if (taints.length === 0) return
		this.setWaitingNodes(taints)

		let promises = dependenciesDecorations(ctx, this.nodeStore.dependencies)

		promises.forEach(p => p.then(this.outputPromiseHandler.bind(this)))
	}

	onDidCloseTextDocument(document: TextDocument) {
		if (!document.fileName.endsWith("Cargo.toml")) return
		if (this.nodeStore.skip(document.uri.path)) {
			return
		}
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
}