import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, ExtensionContext, Position, ProviderResult, Range, TextDocument, window } from "vscode"
import { versionsCompletionList } from "./versionsCompletionList"
import { featuresCompletionList } from "./featuresCompletionList"
import { crateNameCompletionList } from "./crateNameCompletionList"
import { symbolTree, SymbolTreeNode } from "./symbolTree"
import { squezze } from "util/squzze"
export class CratesCompletionProvider implements CompletionItemProvider {

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
		const tree = await symbolTree(document.uri)
		if (tree.length === 0) {
			return []
		}

		let withinDependenciesBlock = false
		let isComplexDependencyBlock = false
		let crateName: string | undefined
		let versionRange: Range | undefined
		let versionNode: SymbolTreeNode | undefined
		let featuresNode: SymbolTreeNode | undefined

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
											continue
										}
										if (grandChild.name === "features") {
											featuresNode = grandChild
											continue
										}
									}
								}
								break
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
			//cursor at version node
			if (versionNode) {
				if (versionNode.range.contains(position)) {
					return await versionsCompletionList(
						this.context,
						crateName,
						versionNode.range
					)
				}
			}

			//cursor at features node
			if (featuresNode && featuresNode.children.length !== 0) {
				if (featuresNode.range.contains(position)) {
					const version = document.getText(squezze(versionNode?.range))
					let range
					let existedFeatures: string[] = []
					for (let f of featuresNode.children) {
						if (f.range.contains(position)) {
							range = f.range
							continue
						}
						existedFeatures.push(document.getText(squezze(f.range)))
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

			//cursor at simple dependency version
			if (!isComplexDependencyBlock) {
				return await versionsCompletionList(
					this.context,
					crateName!,
					versionRange
				)
			}
		}

		//cursor at crate name
		return await crateNameCompletionList(document, position)
	}
}
