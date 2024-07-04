import { ExtensionContext, TextDocumentChangeEvent, window, Range, TextEditorDecorationType, TextDocument, TextEditor } from "vscode"
import { DependenciesTraverser, symbolTree } from "./symbolTree"
import { parseDependencies } from "@usecase"
import { DecorationStatus, CrateDecoration, versionItemKey } from "@entity"

export class Listener {
	private ctx: ExtensionContext
	//TODO messy, please fix
	private decorationState: { [key: string]: DecorationState }
	//TODO messy, please fix
	private identifiers: Set<string> = new Set()
	constructor(ctx: ExtensionContext) {
		this.ctx = ctx
		this.decorationState = {}
	}
	async onChange(document: TextDocument) {
		const tree = await symbolTree(document.uri)
		if (tree.length === 0) {
			return
		}
		const walker = new DependenciesTraverser(tree, document)
		walker.walk()
		this.updateCrates(walker.identifiers)

		let promises = parseDependencies(this.ctx, walker.dependencies)

		while (promises.length > 0) {
			// Use Promise.race to get the first resolved promise
			const { promise, result } = await Promise.race(promises.map(p =>
				p.then(value => ({ promise: p, result: value }),
					reason => ({ promise: p, result: reason }))
			))

			// Process the result
			if (!(result instanceof Error)) {
				if (result.decoration) {
					const d = this.decoration(result.dependencyIdentifier, result.decoration)
					if (d !== null) {
						window.activeTextEditor?.setDecorations(d, [walker.m[result.decoration.key]])
					}
				}
				if (result.diagnostics) { }
			} else {
				console.error('Rejected reason:', result)
			}

			promises = promises.filter(p => p !== promise)
		}
		return
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
		await this.onChange(editor.document)
	}

	updateCrates(newCrates: string[]) {
		// Convert the new array to a set for efficient lookups
		const newSet = new Set(newCrates)

		// Find items to delete (present in persistentSet but not in newSet)
		const deletedItems = [...this.identifiers].filter(item => !newSet.has(item))

		// Update the persistent set: remove deleted items
		deletedItems.forEach(item => this.identifiers.delete(item))

		// Add new items from the new array to the persistent set
		newCrates.forEach(item => this.identifiers.add(item))

		//clear decorations state
		for (let d of deletedItems) {
			this.decorationState[d].decoration.dispose()
			delete this.decorationState[d]
		}
	}

	//decoration return an old decoration or new onee
	decoration(id: string, deco: CrateDecoration): TextEditorDecorationType | null {
		const key = versionItemKey(id, deco.latest)
		const d = this.decorationState[id]
		if (d) {
			if (d.key === key && d.status === deco.status) {
				return d.decoration
			} else {
				d.decoration.dispose()
			}
		}
		switch (deco.status) {
			case DecorationStatus.LATEST:
				const newLatest = latestDecoration(deco.latest)
				this.decorationState[id] = { key: key, status: deco.status, decoration: newLatest }
				return newLatest
			case DecorationStatus.OUTDATED:
				const newOutdated = outdatedDecoration(deco.latest)
				this.decorationState[id] = { key: key, status: deco.status, decoration: newOutdated }
				return newOutdated
			case DecorationStatus.ERROR:
				const newError = errorDecoration(deco.latest)
				this.decorationState[id] = { key: key, status: deco.status, decoration: newError }
				return newError
		}
	}
}

type DecorationState = {
	key: string,
	status: DecorationStatus,
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

function outdatedDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '🟡 ' + latest,
			color: 'orange',
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
