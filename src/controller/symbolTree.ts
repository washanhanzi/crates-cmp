import { async } from "@washanhanzi/result-enum"
import { executeCommand } from "./command"
import { Uri, window, Range, TextDocument } from "vscode"
import { CargoTable, DependencyKey, DependencyNode } from "@/entity"
import { squezze } from "util/squzze"
import { delay } from "util/delay"
import { DocumentTree } from "./documentTree"


export type SymbolTreeNode = {
	name: string
	range: Range
	children: SymbolTreeNode[]
}

export class CargoTomlWalker {
	enterTable(node: SymbolTreeNode, table: CargoTable,): boolean { return true }
	enterDependencies(node: SymbolTreeNode, table: CargoTable): boolean { return true }

	onPackage(id: string, node: SymbolTreeNode): void { }
	onDependencies(id: string, node: SymbolTreeNode, table: CargoTable, platform?: string): void { }
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
					if (this.enterTable(node, CargoTable.PACKAGE)) {
						this.onPackage(node.name, node)
					}
					break
				case 'dependencies':
					if (this.enterDependencies(node, CargoTable.DEPENDENCIES)) {
						this.onDependencies(node.name, node, CargoTable.DEPENDENCIES)
					}
					break
				case 'dev-dependencies':
					if (this.enterDependencies(node, CargoTable.DEV_DEPENDENCIES)) {
						this.onDependencies(node.name, node, CargoTable.DEV_DEPENDENCIES)
					}
					break
				case 'build-dependencies':
					if (this.enterDependencies(node, CargoTable.BUILD_DEPENDENCIES)) {
						this.onDependencies(node.name, node, CargoTable.BUILD_DEPENDENCIES)
					}
					break
				case "target":
					if (this.enterDependencies(node, CargoTable.DEPENDENCIES)) {
						for (let child of node.children) {
							for (let grandChild of child.children) {
								this.onDependencies(nodeId(node.name, child.name, grandChild.name), grandChild, CargoTable.DEPENDENCIES, child.name)
							}
						}
					}
				case 'features':
					if (this.enterTable(node, CargoTable.FEATURES)) {
						this.onFeatures(node.name, node)
					}
					break
				case 'workspace':
					if (this.enterTable(node, CargoTable.WORKSPACE)) {
						this.onWorkspace(node.name, node)
					}
					break
				case 'lib':
					if (this.enterTable(node, CargoTable.LIB)) {
						this.onLib(node.name, node)
					}
					break
				case 'bin':
					if (this.enterTable(node, CargoTable.BIN)) {
						this.onBin(node.name, node)
					}
					break
				case 'profile':
					if (this.enterTable(node, CargoTable.PROFILE)) {
						this.onProfile(node.name, node)
					}
					break
				case 'badges':
					if (this.enterTable(node, CargoTable.BADGES)) {
						this.onBadges(node.name, node)
					}
					break
				default:
					if (this.enterTable(node, CargoTable.OTHER)) {
						this.onOther(node.name, node)
					}
					break
			}
		}
	}
}

export class DependenciesWalker extends CargoTomlWalker {
	enterCrate(node: SymbolTreeNode): boolean { return true }
	onCrate(id: string, node: SymbolTreeNode, table: CargoTable, platform?: string) { }

	onDependencies(id: string, node: SymbolTreeNode, table: CargoTable, platform?: string) {
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
	enterTable(node: SymbolTreeNode, table: CargoTable): boolean {
		return false
	}

	//only enter dependencies
	enterDependencies(node: SymbolTreeNode, table: CargoTable): boolean {
		return true
	}

	//enter all crate
	enterCrate(node: SymbolTreeNode): boolean {
		return true
	}

	onCrate(id: string, node: SymbolTreeNode, table: CargoTable, platform?: string) {
		const crateName = node.name
		const input: DependencyNode = {
			id: id,
			name: crateName,
			version: { id: "", value: "", dependencyId: "" },
			features: [],
			table: table,
			platform: platform
		}
		const rangeIds: string[] = []

		//set crate
		const nodeV = this.doc.getText(node.range).replace(/(\r\n|\r|\n)/g, '>')
		//compare nodeV with exsit node
		this.docTree.visitDependency(input.id, nodeV, node.range)
		this.docTree.visitNode(input.id, { id, table, range: node.range, value: nodeV, dependency: { dependencyId: input.id, key: DependencyKey.CRATE } })
		rangeIds.push(input.id)

		//simple dependency, early return
		if (node.children.length === 0) {
			const version = this.doc.getText(squezze(node.range))
			input.version = { id, value: version, dependencyId: id }
			//overide node
			this.docTree.visitNode(input.id, { id, table, range: node.range, value: nodeV, dependency: { dependencyId: input.id, key: DependencyKey.SIMPLE_VERSION } })
			this.docTree.addDependency(input)
			this.docTree.setRnages(node.range, rangeIds)

			return
		}

		//complex dependency
		for (let child of node.children) {
			if (child.name === "version") {
				const version = this.doc.getText(squezze(child.range))
				const id = nodeId(input.id, child.name)
				input.version = { id, value: version, dependencyId: input.id }
				this.docTree.visitNode(id, { id, table, value: version, range: child.range, dependency: { dependencyId: input.id, key: DependencyKey.VERSION } })
				rangeIds.push(id)
				continue
			}
			if (child.name === "features") {
				if (child.children.length !== 0) {
					for (let grandChild of child.children) {
						const f = this.doc.getText(squezze(grandChild.range))
						const id = nodeId(input.id, child.name, grandChild.name)
						this.docTree.visitNode(id, { id, table, value: f, range: grandChild.range, dependency: { dependencyId: input.id, key: DependencyKey.FEATURE } })
						input.features.push({ id, value: f, dependencyId: input.id })
						rangeIds.push(id)
					}
				} else {
					const f = this.doc.getText(squezze(child.range))
					const id = nodeId(input.id, child.name)
					this.docTree.visitNode(id, { id, table, value: f, range: child.range, dependency: { dependencyId: input.id, key: DependencyKey.FEATURE } })
					input.features.push({ id, value: f, dependencyId: input.id })
					rangeIds.push(id)
				}
				continue
			}
			if (child.name === "package") {
				const id = nodeId(input.id, child.name)
				const p = this.doc.getText(squezze(child.range))
				input.packageName = p
				this.docTree.visitNode(id, { id, table, value: p, range: child.range, dependency: { dependencyId: input.id, key: DependencyKey.PACKAGE } })
				rangeIds.push(id)
			}
			if (child.name === "path") {
				const id = nodeId(input.id, child.name)
				const path = this.doc.getText(squezze(child.range))
				input.path = { id, dependencyId: input.id, value: path }
				this.docTree.visitNode(id, { id, table, value: path, range: child.range, dependency: { dependencyId: input.id, key: DependencyKey.PATH } })
				rangeIds.push(id)
			}
			//TODO  git
		}
		this.docTree.addDependency(input)
		this.docTree.setRnages(node.range, rangeIds)
	}
}

export function nodeId(...params: string[]): string {
	return params.join('.')
}