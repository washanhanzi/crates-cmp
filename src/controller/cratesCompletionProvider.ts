import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, ExtensionContext, Position, ProviderResult, Range, TextDocument, window } from "vscode"
import { versionsCompletionList } from "./versionsCompletionList"
import { featuresCompletionList } from "./featuresCompletionList"
import { crateNameCompletionList } from "./crateNameCompletionList"
import { DependenciesWalker, symbolTree, SymbolTreeNode } from "./symbolTree"
import { squezze } from "util/squzze"
import { DependenciesTable } from "@entity"
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

		const walker = new CratesCompletionWalker(tree, position)
		walker.walk()

		//cursor at crate name
		if (!walker.crateName) {
			return await crateNameCompletionList(document, position)
		}

		//cursor at version node
		if (walker.versionNode) {
			if (walker.versionNode.range.contains(position)) {
				return await versionsCompletionList(
					this.context,
					walker.crateName!,
					walker.versionNode.range
				)
			}
		}

		//cursor at features node
		if (walker.featuresNode && walker.featuresNode.children.length !== 0) {
			if (walker.featuresNode.range.contains(position)) {
				const version = document.getText(squezze(walker.versionNode?.range))
				let range
				let existedFeatures: string[] = []
				for (let f of walker.featuresNode.children) {
					if (f.range.contains(position)) {
						range = f.range
						continue
					}
					existedFeatures.push(document.getText(squezze(f.range)))
				}
				return await featuresCompletionList(
					this.context,
					walker.crateName!,
					version,
					existedFeatures,
					range
				)
			}
			return []
		}

		//cursor at simple dependency version
		if (!walker.isComplexDependencyBlock) {
			return await versionsCompletionList(
				this.context,
				walker.crateName!,
				walker.crateRange
			)
		}

		return []
	}
}

class CratesCompletionWalker extends DependenciesWalker {
	isComplexDependencyBlock = false
	crateName: string | undefined
	crateRange: Range | undefined
	versionNode: SymbolTreeNode | undefined
	featuresNode: SymbolTreeNode | undefined
	position: Position

	constructor(tree: SymbolTreeNode[], position: Position) {
		super(tree)
		this.position = position
	}

	enterTable(node, table): boolean {
		return false
	}

	enterDependencies(node: SymbolTreeNode, table: DependenciesTable): boolean {
		if (node.range.contains(this.position)) {
			return true
		}
		return false
	}

	enterCrate(node: SymbolTreeNode): boolean {
		if (node.range.contains(this.position)) {
			return true
		}
		return false
	}

	onCrate(id: string, node: SymbolTreeNode): void {
		this.crateName = node.name
		this.crateRange = node.range
		if (node.children.length !== 0) {
			this.isComplexDependencyBlock = true
			for (let child of node.children) {
				if (child.name === "version") {
					this.versionNode = child
					continue
				}
				if (child.name === "features") {
					this.featuresNode = child
					continue
				}
			}
		}
		//stop entering more crate
		this.enterCrate = (n) => false
	}
}