import { async } from "@washanhanzi/result-enum"
import { executeCommand } from "./command"
import { Uri, window, Range, TextDocument } from "vscode"
import { CargoTomlTable, DependencyItemType, DependencyNode } from "@entity"
import { squezze } from "util/squzze"
import { delay } from "util/delay"


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
					if (this.enterDependencies(node, CargoTomlTable.TARGET_DEPENDENCIES)) {
						for (let child of node.children) {
							for (let grandChild of child.children) {
								this.onDependencies(nodeId(node.name, child.name, grandChild.name), grandChild, CargoTomlTable.TARGET_DEPENDENCIES, child.name)
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
	dependencies: DependencyNode[] = []
	nodeStore: NodeStore
	identifiers: string[] = []

	private doc: TextDocument

	constructor(tree: SymbolTreeNode[], doc: TextDocument, nodeStore: NodeStore) {
		super(tree)
		this.doc = doc
		this.nodeStore = nodeStore
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
			currentVersion: "",
			features: [],
			tableName: table,
			platform: platform
		}
		this.identifiers.push(input.id)
		//set crate range
		this.nodeStore.set(input.id, { value: this.doc.getText(node.range), table: table, range: node.range, denpendencyType: DependencyItemType.CRATE })

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
				this.nodeStore.set(nodeId(input.id, child.name), { value: version, range: child.range, table: table, denpendencyType: DependencyItemType.VERSION })
				continue
			}
			if (child.name === "features") {
				if (child.children.length !== 0) {
					for (let grandChild of child.children) {
						const f = this.doc.getText(squezze(grandChild.range))
						this.nodeStore.set(nodeId(input.id, child.name, grandChild.name), { value: f, range: grandChild.range, table: table, denpendencyType: DependencyItemType.FEATURE })
						input.features.push(f)
					}
				} else {
					const f = this.doc.getText(squezze(child.range))
					this.nodeStore.set(nodeId(input.id, child.name), { value: f, range: child.range, table: table, denpendencyType: DependencyItemType.FEATURE })
					input.features.push(f)
				}
				continue
			}
			if (child.name === "package") {
				input.packageName = this.doc.getText(squezze(child.range))
			}
			//TODO path, git
		}
		this.dependencies.push(input)
	}
}

export function nodeId(...params: string[]): string {
	return params.join('.')
}

type TreeNode = {
	value: string,
	range: Range
	table: CargoTomlTable,
	denpendencyType: DependencyItemType
}

export class NodeStore {
	private m: { [key: string]: TreeNode } = {}
	private dirtyNodes: Set<string> = new Set()
	private newlyAdded: Set<string> = new Set()
	private deleted: Set<string> = new Set()
	private uri: string | undefined = undefined
	constructor() {
		this.m = {}
	}

	init(uri: string) {
		if (this.uri !== uri) {
			this.m = {}
			this.uri = uri
			this.dirtyNodes.clear()
			this.newlyAdded.clear()
			this.deleted.clear()
			return
		}
		this.dirtyNodes.clear()
		this.newlyAdded.clear()
		//delete nodes in the previous walk
		for (let key of this.deleted) {
			delete this.m[key]
		}
		this.deleted.clear()
		//init the deleted set
		for (let key of Object.keys(this.m)) {
			this.deleted.add(key)
		}
	}

	isClean() {
		return this.dirtyNodes.size === 0 && this.newlyAdded.size === 0 && this.deleted.size === 0
	}

	node(id: string): TreeNode | undefined {
		return this.m[id] ?? undefined
	}

	range(id: string): Range | undefined {
		return this.m[id]?.range
	}

	set(id: string, node: TreeNode) {
		if (this.m[id] && this.m[id].value !== node.value) {
			this.dirtyNodes.add(id)
		}
		if (!this.m[id]) {
			this.newlyAdded.add(id)
		}
		this.deleted.delete(id)
		this.m[id] = node
	}

	deletedIds(): string[] {
		return [...this.deleted]
	}

	dirtyIds(): string[] {
		return [...this.dirtyNodes]
	}

	addedIds(): string[] {
		return [...this.newlyAdded]
	}

	isDirty(id: string): boolean {
		if (this.dirtyNodes.has(id)) {
			return true
		}
		return false
	}
}