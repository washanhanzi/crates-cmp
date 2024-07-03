import { sortString } from "@entity"
import { versionCmp } from "usecase/versionCmp"
import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, ExtensionContext, Position, ProviderResult, Range, SnippetString, TextDocument, commands, window } from "vscode"
import { versionsCompletionList } from "./versionCmp"
import { executeCommand } from "./promisify"
import { async } from "@washanhanzi/result-enum"

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
		console.log("crateName: ", crateName)
		console.log("versionNode: ", versionNode)
		console.log("featuresNode: ", featuresNode)

		if (crateName) {
			//cursor in version node
			if (versionNode) {
				if ((versionNode.range as Range).contains(position)) {
					return await versionsCompletionList(
						this.context,
						crateName,
						new Range(
							versionNode.range?.start.translate(0, 1)!,
							versionNode.range?.end.translate(0, -1)!,
						)

					)
				}
			}

			//cursor in features node
			if (featuresNode) {
				if (featuresNode.range.contains(position)) {
					console.log("you are typing features")
					return []
				}
			}
			//simple dependency line
			if (!isComplexDependencyBlock) {
				return await versionsCompletionList(
					this.context,
					crateName,
					new Range(
						versionRange?.start.translate(0, 1)!,
						versionRange?.end.translate(0, -1)!,
					),
				)
			}
			return []
		}
		//in dependencies block but unkown crate name
		console.log("you are typing crate name")
		return []
	}
}
