import { sortString } from "@entity"
import { featuresCmp } from "@usecase"
import { async } from "@washanhanzi/result-enum"
import { CompletionItem, CompletionItemKind, ExtensionContext, window, Range, CompletionList } from "vscode"

export async function featuresCompletionList(
	ctx: ExtensionContext,
	crateName: string,
	version: string,
	existedFeatures: string[],
	range?: Range,
) {
	const featuresResult = await async(featuresCmp(ctx, crateName, version, existedFeatures))
	if (featuresResult.isErr()) {
		window.showErrorMessage(featuresResult.unwrapErr().message)
		return []
	}

	const items = featuresResult
		.unwrap()
		.map((feature, i) => {
			const item = new CompletionItem(feature, CompletionItemKind.Constant)
			item.insertText = feature
			item.sortText = sortString(i++)
			item.preselect = i === 0
			item.range = range
			return item
		})
	return new CompletionList(items)
}