import { async } from "@washanhanzi/result-enum"
import { executeCommand } from "./command"
import { Uri, window, Range, TextDocument } from "vscode"
import { crateItemKey, DependencyInput, featureItemKey, versionItemKey } from "@entity/dependency"
import { squezze } from "util/squzze"
import { delay } from "util/delay"

export type SymbolTreeNode = {
	name: string
	range: Range
	children: SymbolTreeNode[]
}

export async function symbolTree(uri: Uri) {
	for (let counter = 0; counter < 3; counter++) {
		const tree = await async(executeCommand("vscode.executeDocumentSymbolProvider", uri))
		console.log("waiting for Even better toml")

		if (tree.isOk()) {
			return tree.unwrap() as SymbolTreeNode[]
		}

		await delay(300)
	}

	window.showErrorMessage("Require `Even Better TOML` extension")
	return []
}

type RangeMap = {
	[key: string]: Range
}

export function parseSymbolTree(tree: SymbolTreeNode[], doc: TextDocument): [DependencyInput[], RangeMap, string[]] {
	const res: DependencyInput[] = []
	const m: RangeMap = {}
	const crates: string[] = []

	for (let node of tree) {
		if (node.name.includes("dependencies")) {
			//in dependencies node
			if (node.children && node.children.length > 0) {
				for (let child of node.children) {
					const input: DependencyInput = {
						name: "",
						version: "",
						features: []
					}
					const crateName = child.name
					crates.push(crateName)
					input.name = crateName
					//set crate range
					m[crateItemKey(input.name)] = child.range

					//find the dependency node
					if (child.children.length !== 0) {
						//complex dependency
						for (let grandChild of child.children) {
							if (grandChild.name === "version") {
								const version = doc.getText(squezze(grandChild.range))
								input.version = version
								m[versionItemKey(crateName, version)]
								continue
							}
							if (grandChild.name === "features") {
								if (grandChild.children.length !== 0) {
									for (let greatGrandChild of grandChild.children) {
										const f = doc.getText(squezze(greatGrandChild.range))
										m[featureItemKey(crateName, f)]
										input.features.push(f)
									}
								} else {
									const f = doc.getText(squezze(grandChild.range))
									m[featureItemKey(crateName, f)]
									input.features.push(f)
								}
								continue
							}
						}
					} else {
						//simple dependency
						const version = doc.getText(squezze(child.range))
						input.version = version
						m[versionItemKey(crateName, version)]
					}
					if (input.version === "") {
						continue
					}
					res.push(input)
				}
			}
		}
	}
	return [res, m, crates]
}