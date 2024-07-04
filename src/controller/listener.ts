import { ExtensionContext, TextDocumentChangeEvent, window, Range, TextEditorDecorationType, TextDocument, TextEditor } from "vscode"
import { parseSymbolTree, symbolTree } from "./symbolTree"
import { parseDependencies } from "@usecase"
import { DecorationStatus, CrateDecoration, versionItemKey } from "@entity"

export class Listener {
	private ctx: ExtensionContext
	private decorationState: { [key: string]: DecorationState }
	private crates: Set<string> = new Set()
	constructor(ctx: ExtensionContext) {
		this.ctx = ctx
		this.decorationState = {}
	}
	async onChange(document: TextDocument) {
		const tree = await symbolTree(document.uri)
		if (tree.length === 0) {
			return
		}
		// window.activeTextEditor?.setDecorations(smallNumberDecorationType, [tree![2]?.children[0].range])
		const [input, m, crates] = parseSymbolTree(tree, document)
		this.updateCrates(crates)

		let promises = parseDependencies(this.ctx, input)

		while (promises.length > 0) {
			// Use Promise.race to get the first resolved promise
			const { promise, result } = await Promise.race(promises.map(p =>
				p.then(value => ({ promise: p, result: value }),
					reason => ({ promise: p, result: reason }))
			))

			// Process the result
			if (!(result instanceof Error)) {
				if (result.decoration) {
					const d = this.decoration(result.name, result.decoration)
					if (d !== null) {
						window.activeTextEditor?.setDecorations(d, [m[result.decoration.key]])
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
		const deletedItems = [...this.crates].filter(item => !newSet.has(item))

		// Update the persistent set: remove deleted items
		deletedItems.forEach(item => this.crates.delete(item))

		// Add new items from the new array to the persistent set
		newCrates.forEach(item => this.crates.add(item))

		//clear decorations state
		for (let d of deletedItems) {
			delete this.decorationState[d]
		}
	}

	decoration(name: string, deco: CrateDecoration): TextEditorDecorationType | null {
		const key = versionItemKey(name, deco.latest)
		const d = this.decorationState[name]
		if (d) {
			if (d.key === key && d.status === deco.status) {
				return null
			} else {
				d.decoration.dispose()
			}
		}
		switch (deco.status) {
			case DecorationStatus.LATEST:
				const newLatest = latestDecoration(deco.latest)
				this.decorationState[name] = { key: key, status: deco.status, decoration: newLatest }
				return newLatest
			case DecorationStatus.OUTDATED:
				const newOutdated = outdatedDecoration(deco.latest)
				this.decorationState[name] = { key: key, status: deco.status, decoration: newOutdated }
				return newOutdated
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
			margin: '0 0 0 2em' // Add some margin to the left
		}
	})

}

function outdatedDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '🟡 ' + latest,
			color: 'orange',
			margin: '0 0 0 2em' // Add some margin to the left
		}
	})

}
