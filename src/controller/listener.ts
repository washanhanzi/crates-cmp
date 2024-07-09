import { ExtensionContext, TextDocumentChangeEvent, window, TextDocument, TextEditor } from "vscode"
import { DependenciesTraverser, NodeStore, symbolTree } from "./symbolTree"
import { parseDependencies } from "@usecase"
import { DependencyDecorationStatus, DependencyDecoration, DependencyOutput, DependencyItemType } from "@entity"
import { DecorationStore, errorDecoration, latestDecoration, loadingDecoration, outdatedDecoration } from "./dependencyDecoration"
import { cargoTree } from "./cargo"
import { async } from "@washanhanzi/result-enum"

export class Listener {
	private ctx: ExtensionContext
	//track the decoration state
	private decorationStore = new DecorationStore()
	//track toml nodes
	private nodeStore: NodeStore = new NodeStore()
	constructor(ctx: ExtensionContext) {
		this.ctx = ctx
	}
	async onChange(document: TextDocument) {
		const tree = await symbolTree(document.uri)
		if (tree.length === 0) {
			return
		}

		const walker = new DependenciesTraverser(tree, document, this.nodeStore)
		this.nodeStore.init(document.uri.path)
		walker.walk()

		//tree is clear
		if (this.nodeStore.isClean()) { return }

		this.addedNodes(this.nodeStore.addedIds())
		this.deletedNodes(this.nodeStore.deletedIds())
		this.dirtyNodes(this.nodeStore.dirtyIds())

		const currentDepsResult = await async(cargoTree(document.uri.path))
		if (currentDepsResult.isErr()) { return }

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
			this.deletedNodes(deleted)
		}

		let promises = parseDependencies(this.ctx, walker.dependencies)

		promises.forEach(p => p.then(this.outputPromiseHandler.bind(this)))

		return
	}

	outputPromiseHandler(output: DependencyOutput) {
		if (output.decoration) {
			this.decorate(output.id, output.decoration)
		}
	}


	addedNodes(ids: string[]) {
		for (let id of ids) {
			//add loading decoration
			this.decorate(id, { id: id, current: "", currentMax: "", latest: "", status: DependencyDecorationStatus.LOADING })
		}
	}

	deletedNodes(ids: string[]) {
		for (let id of ids) {
			//clear decorations state
			this.decorationStore.delete(id)
		}
	}

	dirtyNodes(ids: string[]) {
		for (let id of ids) {
			//add loading decoration
			this.decorate(id, { id: id, current: "", currentMax: "", latest: "", status: DependencyDecorationStatus.LOADING })
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
			case DependencyDecorationStatus.ERROR:
				dt = errorDecoration(deco.latest)
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

	async onDidChangeTextDocument(event: TextDocumentChangeEvent) {
		if (
			event.document.fileName.endsWith("Cargo.toml") &&
			!event.document.isDirty
		) {
			await this.onChange(event.document)
		}
	}

	async onDidChangeActiveEditor(editor: TextEditor | undefined) {
		if (!editor) return
		if (!editor.document.fileName.endsWith("Cargo.toml")) return
		await this.onChange(editor.document)
	}
}


