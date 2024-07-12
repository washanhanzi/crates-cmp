import { async } from "@washanhanzi/result-enum"
import { executeCommand } from "./command"
import { Uri, window, Range, TextDocument } from "vscode"
import { CargoTomlTable, DependencyItemType, DependencyNode } from "@/entity"
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
	private rev: number

	constructor(tree: SymbolTreeNode[], version: number) {
		this.tree = tree
		this.rev = version
	}

	getRev(): number { return this.rev }

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
	nodeStore: NodeStore
	identifiers: string[] = []

	private doc: TextDocument

	constructor(tree: SymbolTreeNode[], doc: TextDocument, nodeStore: NodeStore, version: number) {
		super(tree, version)
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
		//set crate
		this.nodeStore.set(input.id, { value: this.doc.getText(node.range), table: table, range: node.range, denpendencyType: DependencyItemType.CRATE }, this.getRev())
		this.nodeStore.setNode(input.id, { value: this.doc.getText(node.range), table: table, range: node.range, denpendencyType: DependencyItemType.CRATE })

		//simple dependency
		if (node.children.length === 0) {
			const version = this.doc.getText(squezze(node.range))
			input.inputVersion = version
			this.nodeStore.dependencies.push(input)
			return
		}

		//complex dependency
		for (let child of node.children) {
			if (child.name === "version") {
				const version = this.doc.getText(squezze(child.range))
				input.inputVersion = version
				this.nodeStore.setNode(nodeId(input.id, child.name), { value: version, range: child.range, table: table, denpendencyType: DependencyItemType.VERSION })
				continue
			}
			if (child.name === "features") {
				if (child.children.length !== 0) {
					for (let grandChild of child.children) {
						const f = this.doc.getText(squezze(grandChild.range))
						this.nodeStore.setNode(nodeId(input.id, child.name, grandChild.name), { value: f, range: grandChild.range, table: table, denpendencyType: DependencyItemType.FEATURE })
						input.features.push(f)
					}
				} else {
					const f = this.doc.getText(squezze(child.range))
					this.nodeStore.setNode(nodeId(input.id, child.name), { value: f, range: child.range, table: table, denpendencyType: DependencyItemType.FEATURE })
					input.features.push(f)
				}
				continue
			}
			if (child.name === "package") {
				input.packageName = this.doc.getText(squezze(child.range))
			}
			//TODO path, git
		}
		this.nodeStore.dependencies.push(input)
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
	dependencies: DependencyNode[] = []
	private nodes: { [key: string]: TreeNode } = {}

	//track nodes need to be deleted in current walk
	//require to call finishWalk
	private currentDeleted: Set<string> = new Set()

	path: string | undefined = undefined
	documentVersion: number = 0
	rev: number = 0

	//added and updated track the dependency crate nodes
	//we must process all added nodes to clear the tree
	//updated nodes only tracked by the latest version
	private added: Set<string> = new Set()
	private updated: Map<string, number> = new Map()

	constructor() {
		this.nodes = {}
	}

	reset() {
		this.path = undefined
	}

	incRev() {
		this.rev = this.rev + 1
		return this.rev
	}

	init(path: string, documentVersion: number) {
		this.dependencies.length = 0
		this.documentVersion = documentVersion
		//we already init the document
		if (this.path !== path) {
			this.nodes = {}
			this.path = path
			this.currentDeleted.clear()
			this.added.clear()
			this.updated.clear()
			this.rev = 1
			return
		}
		//new document
		this.currentDeleted.clear()
		//init the deleted set
		for (let key of Object.keys(this.nodes)) {
			this.currentDeleted.add(key)
		}
	}

	skip(uri: string) {
		return this.path !== uri
	}

	isClean() {
		return this.added.size === 0 && this.updated.size === 0
	}

	node(id: string): TreeNode | undefined {
		return this.nodes[id] ?? undefined
	}

	range(id: string): Range | undefined {
		return this.nodes[id]?.range
	}

	setNode(id: string, node: TreeNode) {
		this.nodes[id] = node
	}

	set(id: string, node: TreeNode, rev: number) {
		if (this.nodes[id] && this.nodes[id].value !== node.value) {
			this.addUpdated(id, rev)
		}
		if (!this.nodes[id]) {
			this.added.add(id)
		}
		this.currentDeleted.delete(id)
	}

	taint(id: string, rev: number) {
		this.addUpdated(id, rev)
	}

	addUpdated(id: string, rev: number) {
		const v = this.updated.get(id)
		if (v === undefined || v < rev) {
			this.updated.set(id, rev)
		}
	}

	checkAndDelDirty(id: string, rev: number) {
		if (this.added.has(id)) {
			this.added.delete(id)
			return true
		}
		const v = this.updated.get(id)
		if (v === undefined || rev < v) {
			return false
		}
		this.updated.delete(id)
		return true
	}

	deletedIds(): string[] {
		return [...this.currentDeleted]
	}

	dirtyIds(): string[] {
		const u = Array.from(this.updated.keys())
		const a = Array.from(this.added)
		return [...u, ...a]
	}

	finishWalk() {
		for (let k of this.currentDeleted) {
			delete this.nodes[k]
		}
	}

	isDirty(id: string, rev: number): boolean {
		if (this.added.has(id)) {
			return true
		}
		const v = this.updated.get(id)
		if (v === undefined) {
			return false
		}
		return v <= rev
	}
}