import { ExtensionContext, TextDocumentChangeEvent, window, TextDocument, TextEditor, languages, DiagnosticCollection, Diagnostic } from "vscode"
import { DependenciesTraverser, NodeStore, symbolTree } from "./symbolTree"
import { dependenciesDecorations } from "@usecase"
import { DependencyDecorationStatus, DependencyDecoration, DependencyItemType, DependencyDecorationWithCtx } from "@entity"
import { DecorationStore, errorDecoration, latestDecoration, loadingDecoration, outdatedDecoration } from "./dependencyDecoration"
import { cargoTree } from "./cargo"
import { async } from "@washanhanzi/result-enum"
import { dependenciesDiagnostics } from "@usecase/dependenciesDiagnostics"

export class Listener {
	private ctx: ExtensionContext
	//track the decoration state
	private decorationStore = new DecorationStore()
	//track toml nodes
	private nodeStore = new NodeStore()
	private diagnosticCollection: DiagnosticCollection

	constructor(ctx: ExtensionContext) {
		this.ctx = ctx
		this.diagnosticCollection = languages.createDiagnosticCollection("crates-cmp")
	}
	async onChange(document: TextDocument) {
		const ctx = {
			extensionContext: this.ctx,
			path: document.uri.path,
			version: document.version,
		}
		const ctxUri = document.uri

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

		//set dirty nodes in current walk to waiting
		this.setWaitingNodes(this.nodeStore.dirtyIds())

		//suspend
		const currentDepsResult = await async(cargoTree(document.uri.path))
		if (currentDepsResult.isErr()) {
			//resume point, check
			if (this.nodeStore.isClean()) { return }

			//parse for diagnostic
			const filtered = walker.dependencies.filter(d => this.nodeStore.isDirty(d.id, ctx.version))

			//suspend
			const diagnostics = await dependenciesDiagnostics(ctx, filtered)
			//resume point, check
			if (diagnostics.length === 0) { return }

			let clear: string[] = []
			const cols = diagnostics.filter(d => this.nodeStore.checkAndDelDirty(d.diagnostic.id, d.version))
				.map(d => {
					clear.push(d.diagnostic.id)
					return new Diagnostic(this.nodeStore.range(d.diagnostic.id)!, d.diagnostic.message, d.diagnostic.servity)
				})
			if (cols.length === 0) { return }
			this.clearDecoration(clear)
			this.diagnosticCollection.set(document.uri, cols)
			return
		}
		//cargo command is ok, no error
		this.diagnosticCollection.delete(ctxUri)
		//resume point, check
		if (this.nodeStore.isClean()) {
			return
		}

		//parse for decoration
		//TODO same crate in dependencies and dev-dependencies
		let deleted: string[] = []
		const currentDepts = currentDepsResult.unwrap()!
		for (let dep of walker.dependencies) {
			if (currentDepts[dep.name]) {
				dep.currentVersion = currentDepts[dep.name]
				continue
			}
			if (dep.packageName && currentDepts[dep.packageName]) {
				dep.currentVersion = currentDepts[dep.packageName]
				continue
			}
			deleted.push(dep.id)
		}

		if (deleted.length !== 0) {
			this.clearDecoration(deleted)
		}


		let promises = dependenciesDecorations(ctx, walker.dependencies)

		promises.forEach(p => p.then(this.outputPromiseHandler.bind(this)))
	}

	outputPromiseHandler(output: DependencyDecorationWithCtx) {
		if (this.nodeStore.checkAndDelDirty(output.decoration.id, output.version)) {
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
		for (let id of ids) {
			//clear decorations state
			this.decorationStore.delete(id)
		}
	}

	//decoration return an old decoration or new onee
	decorate(id: string, deco: DependencyDecoration) {
		if (this.nodeStore.node(id) && this.nodeStore.node(id)?.denpendencyType !== DependencyItemType.CRATE) {
			return null
		}
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
			this.nodeStore.init(document.uri.path, document.version)
			await this.onChange(document)
		}
	}

	async onDidChangeActiveEditor(editor: TextEditor | undefined) {
		if (!editor) return
		if (!editor.document.fileName.endsWith("Cargo.toml")) return
		this.nodeStore.close()
		this.nodeStore.init(editor.document.uri.path, editor.document.version)
		await this.onChange(editor.document)
	}

	onDidCloseTextDocument(_document: TextDocument) {
		this.nodeStore.close()
	}
}