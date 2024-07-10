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

	//track nodes need to be updated in current walk
	private currentDirty: Set<string> = new Set()
	private currentyAdded: Set<string> = new Set()
	private currentDeleted: Set<string> = new Set()

	//track nodes need to be updated in current and previous walk
	private unpatchedDirty: Set<string> = new Set()
	private unpatchedAdded: Set<string> = new Set()
	private unpatchedDeleted: Set<string> = new Set()

	private uri: string | undefined = undefined

	constructor() {
		this.m = {}
	}

	initialized() {
		return this.uri !== undefined
	}

	init(uri: string) {
		if (this.uri !== uri) {
			this.m = {}
			this.uri = uri
			this.currentDirty.clear()
			this.currentyAdded.clear()
			this.currentDeleted.clear()
			this.unpatchedAdded.clear()
			this.unpatchedDirty.clear()
			this.unpatchedDeleted.clear()
			return
		}
		this.currentDirty.clear()
		this.currentyAdded.clear()
		this.currentDeleted.clear()
		//init the deleted set
		for (let key of Object.keys(this.m)) {
			this.currentDeleted.add(key)
		}
	}

	isClean() {
		return this.currentDirty.size === 0 && this.currentyAdded.size === 0 && this.currentDeleted.size === 0 && this.unpatchedDirty.size === 0 && this.unpatchedAdded.size === 0 && this.unpatchedDeleted.size === 0
	}

	node(id: string): TreeNode | undefined {
		return this.m[id] ?? undefined
	}

	range(id: string): Range | undefined {
		return this.m[id]?.range
	}

	set(id: string, node: TreeNode) {
		if (this.m[id] && this.m[id].value !== node.value) {
			this.currentDirty.add(id)
			this.unpatchedDirty.add(id)
		}
		if (!this.m[id]) {
			this.currentyAdded.add(id)
			this.unpatchedAdded.add(id)
		}
		this.currentDeleted.delete(id)
		this.m[id] = node
	}

	finishWalk() {
		for (let key of this.currentDeleted) {
			this.unpatchedDeleted.add(key)
		}
	}

	deletedIds(): string[] {
		return [...this.currentDeleted]
	}

	dirtyIds(): string[] {
		return [...this.currentDirty]
	}

	addedIds(): string[] {
		return [...this.currentyAdded]
	}

	isAdded(id: string) {
		return this.unpatchedAdded.has(id)
	}

	isDirty(id: string): boolean {
		return this.unpatchedDirty.has(id)
	}

	patch() {
		this.unpatchedAdded.clear()
		this.unpatchedDirty.clear()
		for (let key of this.unpatchedDeleted) {
			delete this.m[key]
		}
		this.unpatchedDeleted.clear()
	}

}