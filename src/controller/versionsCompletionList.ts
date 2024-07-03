import { sortString } from "@entity"
import { versionCmp } from "@usecase"
import { async } from "@washanhanzi/result-enum"
import { window, CompletionItem, CompletionItemKind, CompletionList, ExtensionContext, Range } from "vscode"

export async function versionsCompletionList(ctx: ExtensionContext, crateName: string, range?: Range) {
	const versionsResult = await async(versionCmp(ctx, crateName))
	if (versionsResult.isErr()) {
		window.showErrorMessage(versionsResult.unwrapErr().message)
		return []
	}

	const items = versionsResult.unwrap()
		.map((version, i) => {
			const item = new CompletionItem(version, CompletionItemKind.Constant)
			item.insertText = version
			item.sortText = sortString(i++)
			item.preselect = i === 0
			item.range = range
			return item
		})
	return new CompletionList(items)
}