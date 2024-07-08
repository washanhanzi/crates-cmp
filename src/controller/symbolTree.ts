import { async } from "@washanhanzi/result-enum"
import { executeCommand } from "./command"
import { Uri, window, Range, TextDocument } from "vscode"
import { DependenciesTable, DependencyNode, TopLevelTable } from "@entity"
import { squezze } from "util/squzze"
import { delay } from "util/delay"


export type SymbolTreeNode = {
	name: string
	range: Range
	children: SymbolTreeNode[]
}


export class CargoTomlWalker {
	enterTable(node: SymbolTreeNode, table: TopLevelTable,): boolean { return true }
	enterDependencies(node: SymbolTreeNode, table: DependenciesTable): boolean { return true }

	onPackage(id: string, node: SymbolTreeNode): void { }
	onDependencies(id: string, node: SymbolTreeNode, table: DependenciesTable, platform?: string): void { }
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
					if (this.enterTable(node, TopLevelTable.PACKAGE)) {
						this.onPackage(node.name, node)
					}
					break
				case 'dependencies':
					if (this.enterDependencies(node, DependenciesTable.DEPENDENCIES)) {
						this.onDependencies(node.name, node, DependenciesTable.DEPENDENCIES)
					}
					break
				case 'dev-dependencies':
					if (this.enterDependencies(node, DependenciesTable.DEV_DEPENDENCIES)) {
						this.onDependencies(node.name, node, DependenciesTable.DEV_DEPENDENCIES)
					}
					break
				case 'build-dependencies':
					if (this.enterDependencies(node, DependenciesTable.BUILD_DEPENDENCIES)) {
						this.onDependencies(node.name, node, DependenciesTable.BUILD_DEPENDENCIES)
					}
					break
				case "target":
					if (this.enterDependencies(node, DependenciesTable.TARGET_DEPENDENCIES)) {
						for (let child of node.children[0].children) {
							this.onDependencies(nodeId(node.name, node.children[0].name, child.name), child, DependenciesTable.TARGET_DEPENDENCIES, node.children[0].name)
						}
					}
				case 'features':
					if (this.enterTable(node, TopLevelTable.FEATURES)) {
						this.onFeatures(node.name, node)
					}
					break
				case 'workspace':
					if (this.enterTable(node, TopLevelTable.WORKSPACE)) {
						this.onWorkspace(node.name, node)
					}
					break
				case 'lib':
					if (this.enterTable(node, TopLevelTable.LIB)) {
						this.onLib(node.name, node)
					}
					break
				case 'bin':
					if (this.enterTable(node, TopLevelTable.BIN)) {
						this.onBin(node.name, node)
					}
					break
				case 'profile':
					if (this.enterTable(node, TopLevelTable.PROFILE)) {
						this.onProfile(node.name, node)
					}
					break
				case 'badges':
					if (this.enterTable(node, TopLevelTable.BADGES)) {
						this.onBadges(node.name, node)
					}
					break
				default:
					if (this.enterTable(node, TopLevelTable.OTHER)) {
						this.onOther(node.name, node)
					}
					break
			}
		}
	}
}

export class DependenciesWalker extends CargoTomlWalker {
	enterCrate(node: SymbolTreeNode): boolean { return true }
	onCrate(id: string, node: SymbolTreeNode, table: DependenciesTable, platform?: string) { }

	onDependencies(id: string, node: SymbolTreeNode, table: DependenciesTable, platform?: string) {
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
	dependencies: DependencyNode[] = []
	rangeStore: RangeStore
	identifiers: string[] = []

	private doc: TextDocument

	constructor(tree: SymbolTreeNode[], doc: TextDocument, rangeStore: RangeStore) {
		super(tree)
		this.doc = doc
		this.rangeStore = rangeStore
	}

	//don't enter other tables
	enterTable(node: SymbolTreeNode, table: TopLevelTable): boolean {
		return false
	}

	//only enter dependencies
	enterDependencies(node: SymbolTreeNode, table: DependenciesTable): boolean {
		return true
	}

	//enter all crate
	enterCrate(node: SymbolTreeNode): boolean {
		return true
	}

	onCrate(id: string, node: SymbolTreeNode, table: DependenciesTable, platform?: string) {
		const crateName = node.name
		const input: DependencyNode = {
			id: id,
			name: crateName,
			inputVersion: "",
			currentVersion: "",
			features: [],
			tableName: table,
			platform: platform
		}
		this.identifiers.push(input.id)
		//set crate range
		this.rangeStore.set(input.id, node.range)

		//simple dependency
		if (node.children.length === 0) {
			const version = this.doc.getText(squezze(node.range))
			input.inputVersion = version
			this.dependencies.push(input)
			return
		}

		//complex dependency
		for (let child of node.children) {
			if (child.name === "version") {
				const version = this.doc.getText(squezze(child.range))
				input.inputVersion = version
				this.rangeStore.set(nodeId(input.id, child.name), child.range)
				continue
			}
			if (child.name === "features") {
				if (child.children.length !== 0) {
					for (let grandChild of child.children) {
						const f = this.doc.getText(squezze(grandChild.range))
						this.rangeStore.set(nodeId(input.id, child.name, grandChild.name), grandChild.range)
						input.features.push(f)
					}
				} else {
					const f = this.doc.getText(squezze(child.range))
					this.rangeStore.set(nodeId(input.id, child.name), child.range)
					input.features.push(f)
				}
				continue
			}
			//TODO path, git
		}
		this.dependencies.push(input)
	}
}

export function nodeId(...params: string[]): string {
	return params.join('.')
}

export class RangeStore {
	private m: { [key: string]: Range } = {}
	constructor() {
		this.m = {}
	}

	range(id: string): Range | undefined {
		return this.m[id]
	}
	set(id: string, range: Range) {
		this.m[id] = range
	}
}