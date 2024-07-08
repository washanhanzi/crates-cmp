import { ExtensionContext, TextDocumentChangeEvent, window, Range, TextEditorDecorationType, TextDocument, TextEditor } from "vscode"
import { DependenciesTraverser, RangeStore, symbolTree } from "./symbolTree"
import { parseDependencies } from "@usecase"
import { DependencyDecorationStatus, DependencyDecoration, DependencyOutput } from "@entity"
import { exec } from "child_process"
import { async } from "@washanhanzi/result-enum"
import { delay } from "util/delay"
import { rustAnalyzer } from "./rustAnalyzer"
import { outdatedDecoration } from "./dependencyDecoration"
import { cargoTree } from "./cargo"

export class Listener {
	private ctx: ExtensionContext
	//track the decoration state
	private decorationState: { [key: string]: DecorationState }
	//track all the toml nodes in the editor
	private nodes: Set<string> = new Set()
	private rangeStore: RangeStore = new RangeStore()
	constructor(ctx: ExtensionContext) {
		this.ctx = ctx
		this.decorationState = {}
	}
	async onChange(document: TextDocument) {


		// const t = window.createTerminal("crates-cmp")
		// t.sendText("cargo tree --depth 1")

		const tree = await symbolTree(document.uri)
		if (tree.length === 0) {
			return
		}


		const walker = new DependenciesTraverser(tree, document, this.rangeStore)
		walker.walk()
		this.updateCrates(walker.identifiers)

		const currentDeps = await cargoTree(document.uri.path)
		if (!currentDeps) {
			return
		}

		for (let dep of walker.dependencies) {
			dep.currentVersion = currentDeps![dep.name]
		}

		let promises = parseDependencies(this.ctx, walker.dependencies)

		promises.forEach(p => p.then(this.outputPromiseHandler.bind(this)))

		return
	}

	outputPromiseHandler(output: DependencyOutput) {
		if (output.decoration) {
			const d = this.decoration(output.id, output.decoration)
			if (d !== null) {
				window.activeTextEditor?.setDecorations(d, [this.rangeStore.range(output.decoration.id)!])
			}
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

	updateCrates(newCrates: string[]) {
		// Convert the new array to a set for efficient lookups
		const newSet = new Set(newCrates)

		// Find items to delete (present in persistentSet but not in newSet)
		const deletedItems = [...this.nodes].filter(item => !newSet.has(item))

		// Update the persistent set: remove deleted items
		deletedItems.forEach(item => this.nodes.delete(item))

		// Add new items from the new array to the persistent set
		newCrates.forEach(item => this.nodes.add(item))

		//clear decorations state
		for (let d of deletedItems) {
			this.decorationState[d].decoration.dispose()
			delete this.decorationState[d]
		}
	}

	//decoration return an old decoration or new onee
	decoration(id: string, deco: DependencyDecoration): TextEditorDecorationType | null {
		const d = this.decorationState[id]
		if (d) {
			if (d.latest === deco.latest && d.status === deco.status) {
				return d.decoration
			} else {
				d.decoration.dispose()
			}
		}
		switch (deco.status) {
			case DependencyDecorationStatus.LATEST:
				const newLatest = latestDecoration(deco.latest)
				this.decorationState[id] = { latest: deco.latest, status: deco.status, decoration: newLatest }
				return newLatest
			case DependencyDecorationStatus.OUTDATED:
				const newOutdated = outdatedDecoration(deco)
				this.decorationState[id] = { latest: deco.latest, status: deco.status, decoration: newOutdated }
				return newOutdated
			case DependencyDecorationStatus.ERROR:
				const newError = errorDecoration(deco.latest)
				this.decorationState[id] = { latest: deco.latest, status: deco.status, decoration: newError }
				return newError
		}
	}
}

type DecorationState = {
	status: DependencyDecorationStatus,
	latest: string,
	decoration: TextEditorDecorationType
}

function latestDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '✅ ' + latest,
			color: 'green',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})

}


function errorDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '❌ ' + latest,
			color: 'red',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})
}