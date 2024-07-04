import { sortString } from "@util"
import { searchCrate } from "@usecase/searchCrate"
import { async } from "@washanhanzi/result-enum"
import { window, Position, TextDocument, Range, CompletionItem, CompletionItemKind } from "vscode"

export async function crateNameCompletionList(document: TextDocument, position: Position) {
	const lineText = getTextBeforeCursor(document, position)

	const searchResult = await async(searchCrate(lineText))
	if (searchResult.isErr()) {
		window.showErrorMessage(searchResult.unwrapErr().message)
		return []
	}

	const [firstNonEmptyIndex, lastNonEmptyIndex] = lineReplaceRange(lineText)
	const items = searchResult
		.unwrap()
		.map((crate, i) => {
			const item = new CompletionItem(crate.name, CompletionItemKind.Constant)
			item.insertText = crate.name
			item.documentation = crate.description
			item.detail = "max version: " + crate.max_version
			item.sortText = sortString(i++)
			item.preselect = i === 0
			item.range = new Range(position.line, firstNonEmptyIndex, position.line, lastNonEmptyIndex)
			return item
		})

	return items
}

function getTextBeforeCursor(document: TextDocument, position: Position): string {
	const range = new Range(position.line, 0, position.line, position.character)
	return document.getText(range)
}

function lineReplaceRange(lineText: string): [number, number] {
	let firstNonEmptyIndex = -1
	let lastNonEmptyIndex = -1

	// Iterate through the string to find the first and last non-empty index
	for (let i = 0; i < lineText.length; i++) {
		if (lineText[i].trim() !== '') {
			if (firstNonEmptyIndex === -1) {
				firstNonEmptyIndex = i
			}
			lastNonEmptyIndex = i
		}
	}

	return [firstNonEmptyIndex, lastNonEmptyIndex]
}