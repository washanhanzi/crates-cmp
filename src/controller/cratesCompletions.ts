import { sortString } from "@entity"
import { versionCmp } from "usecase/versionCmp"
import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, ExtensionContext, Position, ProviderResult, Range, SnippetString, TextDocument, commands, window } from "vscode"
import { versionsCompletionList } from "./versionsCompletionList"
import { executeCommand } from "./promisify"
import { async } from "@washanhanzi/result-enum"
import { featuresCompletionList } from "./featuresCompletionList"
import { crateNameCompletionList } from "./crateNameCompletionList"

type Node = {
	name: string
	range: Range
	children: Node[]
}

export class CratesCompletions implements CompletionItemProvider {

	private context: ExtensionContext

	constructor(context: ExtensionContext) {
		this.context = context
	}

	provideCompletionItems(
		document: TextDocument,
		position: Position,
		_token: CancellationToken,
		context: CompletionContext
	): ProviderResult<CompletionItem[] | CompletionList> {
		return new Promise(async (resolve) => {
			const res = await this.completionItems(document, position, _token, context)
			resolve(res)
		})
	}

	async completionItems(
		document: TextDocument,
		position: Position,
		_token: CancellationToken,
		_context: CompletionContext
	): Promise<ProviderResult<CompletionItem[] | CompletionList>> {
		const treeResult = await async(executeCommand("vscode.executeDocumentSymbolProvider", document.uri))
		if (treeResult.isErr()) {
			window.showErrorMessage("Require `Even Better TOML` extension")
			return []
		}
		const tree = treeResult.unwrap() as Node[]

		let withinDependenciesBlock = false
		let isComplexDependencyBlock = false
		let crateName: string | undefined
		let versionRange: Range | undefined
		let versionNode: Node | undefined
		let featuresNode: Node | undefined

		for (let node of tree) {
			if (node.name.includes("dependencies")) {
				withinDependenciesBlock = true
				//in dependencies node
				if ((node.range as Range).contains(position)) {
					if (node.children && node.children.length > 0) {
						for (let child of node.children) {
							//find the dependency node
							if ((child.range as Range).contains(position)) {
								crateName = child.name
								versionRange = child.range
								if (child.children && child.children.length > 0) {
									isComplexDependencyBlock = true
									for (let grandChild of child.children) {
										if (grandChild.name === "version") {
											versionNode = grandChild
										}
										if (grandChild.name === "features") {
											featuresNode = grandChild
										}
									}
								}
							}
						}
					}
				}

			}
		}
		//not in dependencies block
		if (!withinDependenciesBlock) {
			return []
		}

		if (crateName) {
			//cursor in version node
			if (versionNode) {
				if (versionNode.range.contains(position)) {
					return await versionsCompletionList(
						this.context,
						crateName,
						versionNode.range
					)
				}
			}

			//cursor in features node
			if (featuresNode && featuresNode.children.length !== 0) {
				if (featuresNode.range.contains(position)) {
					const version = document.getText(versionNode?.range)
					let range
					let existedFeatures: string[] = []
					for (let f of featuresNode.children) {
						if (f.range.contains(position)) {
							range = f.range
							continue
						}
						existedFeatures.push(document.getText(f.range))
					}
					return await featuresCompletionList(
						this.context,
						crateName,
						version,
						existedFeatures,
						range
					)
				}
				return []
			}
			if (!isComplexDependencyBlock) {
				return await versionsCompletionList(
					this.context,
					crateName!,
					versionRange
				)
			}
		}
		//cursor in crate name
		return await crateNameCompletionList(document, position)
	}
}
