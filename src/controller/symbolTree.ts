import { async } from "@washanhanzi/result-enum"
import { executeCommand } from "./command"
import { Uri, window, Range, TextDocument } from "vscode"
import { CargoTomlTable, DependencyItemType, DependencyNode } from "@/entity"
import { squezze } from "util/squzze"
import { delay } from "util/delay"
import { DocumentTree } from "./documentTree"


export type SymbolTreeNode = {
	name: string
	range: Range
	children: SymbolTreeNode[]
}

export class CargoTomlWalker {
	enterTable(node: SymbolTreeNode, table: CargoTomlTable,): boolean { return true }
	enterDependencies(node: SymbolTreeNode, table: CargoTomlTable): boolean { return true }

	onPackage(id: string, node: SymbolTreeNode): void { }
	onDependencies(id: string, node: SymbolTreeNode, table: CargoTomlTable, platform?: string): void { }
	onFeatures(id: string, node: SymbolTreeNode): void { }
	onWorkspace(id: string, node: SymbolTreeNode): void { }
	onLib(id: string, node: SymbolTreeNode): void { }
	onBin(id: string, node: SymbolTreeNode): void { }
	onProfile(id: string, node: SymbolTreeNode): void { }
	onBadges(id: string, node: SymbolTreeNode): void { }
	onOther(id: string, node: SymbolTreeNode): void { }

	private tree: SymbolTreeNode[]

	constructor(tree: SymbolTreeNode[]) {
		this.tree = tree
	}


	walk(): void {
		for (let node of this.tree) {
			switch (node.name) {
				case 'package':
					if (this.enterTable(node, CargoTomlTable.PACKAGE)) {
						this.onPackage(node.name, node)
					}
					break
				case 'dependencies':
					if (this.enterDependencies(node, CargoTomlTable.DEPENDENCIES)) {
						this.onDependencies(node.name, node, CargoTomlTable.DEPENDENCIES)
					}
					break
				case 'dev-dependencies':
					if (this.enterDependencies(node, CargoTomlTable.DEV_DEPENDENCIES)) {
						this.onDependencies(node.name, node, CargoTomlTable.DEV_DEPENDENCIES)
					}
					break
				case 'build-dependencies':
					if (this.enterDependencies(node, CargoTomlTable.BUILD_DEPENDENCIES)) {
						this.onDependencies(node.name, node, CargoTomlTable.BUILD_DEPENDENCIES)
					}
					break
				case "target":
					if (this.enterDependencies(node, CargoTomlTable.DEPENDENCIES)) {
						for (let child of node.children) {
							for (let grandChild of child.children) {
								this.onDependencies(nodeId(node.name, child.name, grandChild.name), grandChild, CargoTomlTable.DEPENDENCIES, child.name)
							}
						}
					}
				case 'features':
					if (this.enterTable(node, CargoTomlTable.FEATURES)) {
						this.onFeatures(node.name, node)
					}
					break
				case 'workspace':
					if (this.enterTable(node, CargoTomlTable.WORKSPACE)) {
						this.onWorkspace(node.name, node)
					}
					break
				case 'lib':
					if (this.enterTable(node, CargoTomlTable.LIB)) {
						this.onLib(node.name, node)
					}
					break
				case 'bin':
					if (this.enterTable(node, CargoTomlTable.BIN)) {
						this.onBin(node.name, node)
					}
					break
				case 'profile':
					if (this.enterTable(node, CargoTomlTable.PROFILE)) {
						this.onProfile(node.name, node)
					}
					break
				case 'badges':
					if (this.enterTable(node, CargoTomlTable.BADGES)) {
						this.onBadges(node.name, node)
					}
					break
				default:
					if (this.enterTable(node, CargoTomlTable.OTHER)) {
						this.onOther(node.name, node)
					}
					break
			}
		}
	}
}

export class DependenciesWalker extends CargoTomlWalker {
	enterCrate(node: SymbolTreeNode): boolean { return true }
	onCrate(id: string, node: SymbolTreeNode, table: CargoTomlTable, platform?: string) { }

	onDependencies(id: string, node: SymbolTreeNode, table: CargoTomlTable, platform?: string) {
		for (let crate of node.children) {
			if (this.enterCrate(crate)) {
				this.onCrate(nodeId(id, crate.name), crate, table, platform)
			}
		}
	}
}


export async function symbolTree(uri: Uri) {
	for (let counter = 0; counter < 5; counter++) {
		const tree = await async(executeCommand("vscode.executeDocumentSymbolProvider", uri))
		console.log("waiting for Even better toml")

		if (tree.isOk()) {
			return tree.unwrap() as SymbolTreeNode[]
		}

		await delay(500)
	}

	window.showErrorMessage("Require `Even Better TOML` extension")
	return []
}

export class DependenciesTraverser extends DependenciesWalker {
	identifiers: string[] = []

	private doc: TextDocument
	private docTree: DocumentTree

	constructor(tree: SymbolTreeNode[], doc: TextDocument, docTree: DocumentTree) {
		super(tree)
		this.doc = doc
		this.docTree = docTree
	}

	//don't enter other tables
	enterTable(node: SymbolTreeNode, table: CargoTomlTable): boolean {
		return false
	}

	//only enter dependencies
	enterDependencies(node: SymbolTreeNode, table: CargoTomlTable): boolean {
		return true
	}

	//enter all crate
	enterCrate(node: SymbolTreeNode): boolean {
		return true
	}

	onCrate(id: string, node: SymbolTreeNode, table: CargoTomlTable, platform?: string) {
		const crateName = node.name
		const input: DependencyNode = {
			id: id,
			name: crateName,
			inputVersion: "",
			features: [],
			tableName: table,
			platform: platform
		}
		//set crate
		const nodeV = this.doc.getText(node.range).replace(/(\r\n|\r|\n)/g, '>')
		this.docTree.visitDependency(input.id, nodeV, node.range)
		this.docTree.visitNode(input.id, { range: node.range, value: nodeV })

		//simple dependency
		if (node.children.length === 0) {
			const version = this.doc.getText(squezze(node.range))
			input.inputVersion = version
			this.docTree.addDependency(input)

			return
		}

		//complex dependency
		for (let child of node.children) {
			if (child.name === "version") {
				const version = this.doc.getText(squezze(child.range))
				input.inputVersion = version
				this.docTree.visitNode(nodeId(input.id, child.name), { value: version, range: child.range })
				continue
			}
			if (child.name === "features") {
				if (child.children.length !== 0) {
					for (let grandChild of child.children) {
						const f = this.doc.getText(squezze(grandChild.range))
						this.docTree.visitNode(nodeId(input.id, child.name, grandChild.name), { value: f, range: grandChild.range })
						input.features.push(f)
					}
				} else {
					const f = this.doc.getText(squezze(child.range))
					this.docTree.visitNode(nodeId(input.id, child.name), { value: f, range: child.range })
					input.features.push(f)
				}
				continue
			}
			if (child.name === "package") {
				input.packageName = this.doc.getText(squezze(child.range))
			}
			//TODO path, git
		}
		this.docTree.addDependency(input)
	}
}

export function nodeId(...params: string[]): string {
	return params.join('.')
}