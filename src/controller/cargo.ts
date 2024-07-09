import { async } from "@washanhanzi/result-enum"
import { execAsync } from "util/execAsync"

export async function cargoTree(path: string): Promise<{ [key: string]: string }> {
	const tree = await async(execAsync(`cargo tree --manifest-path ${path} --depth 1 --all-features`))
	if (tree.isErr()) {
		throw tree.unwrapErr()
	}

	return parseCargoTree(tree.unwrap() as string)
}

function parseCargoTree(output: string) {
	const crateMap = {}
	const lines = output.trim().split('\n')

	lines.forEach(line => {
		const trimmedLine = line.trim()
		const match = trimmedLine.match(/(\S+)\s+v(\d+\.\d+\.\d+(?:[-+]\S+)?)/)
		if (match) {
			const [, crateName, version] = match
			crateMap[crateName] = version
		}
	})

	return crateMap
}
