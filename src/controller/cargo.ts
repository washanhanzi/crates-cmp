import { async } from "@washanhanzi/result-enum"
import { execAsync } from "@/util"
import { CargoTomlTable, Ctx } from "@/entity"

export async function cargoTree(ctx: Ctx) {
	const tree = await async(execAsync(`cargo tree --manifest-path ${ctx.path} --depth 1 --all-features`))
	if (tree.isErr()) {
		throw tree.unwrapErr()
	}

	return parseCargoTreeOutput(tree.unwrap() as string)
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

type CargoTreeOutputItem = {
	name: string
	version: string
	path?: string
	procMacro?: boolean
	deduplicated?: boolean
}

type ParsedCargoTreeOutput = {
	[CargoTomlTable.DEPENDENCIES]: { [key: string]: CargoTreeOutputItem },
	[CargoTomlTable.DEV_DEPENDENCIES]: { [key: string]: CargoTreeOutputItem },
	[CargoTomlTable.BUILD_DEPENDENCIES]: { [key: string]: CargoTreeOutputItem },
}


export function parseCargoTreeOutput(input: string): ParsedCargoTreeOutput {
	const lines = input.split('\n')

	// Initialize a map for the structured data
	let result: ParsedCargoTreeOutput = {
		[CargoTomlTable.DEPENDENCIES]: {},
		[CargoTomlTable.BUILD_DEPENDENCIES]: {},
		[CargoTomlTable.DEV_DEPENDENCIES]: {},
	}

	let currentSection: CargoTomlTable = CargoTomlTable.DEPENDENCIES// Start with 'dependencies' as default

	// Determine the section based on a header line
	function determineSection(line: string) {
		const trimmedLine = line.trim()
		if (trimmedLine === "[build-dependencies]") {
			currentSection = CargoTomlTable.BUILD_DEPENDENCIES
		} else if (trimmedLine === "[dev-dependencies]") {
			currentSection = CargoTomlTable.DEV_DEPENDENCIES
		}
	}

	// Parse a line to extract crate details
	function parseLine(line: string): CargoTreeOutputItem | null {
		let deduplicated = false
		let procMacro = false
		let path: string | undefined = undefined
		const parts = line.trim().split(/\s+/)  // Split line by one or more whitespace

		if (parts.length < 3) return null // Early exit if line doesn't contain enough parts

		const name = parts[1]

		const version = parts[2].startsWith('v') ? parts[2].substring(1) : parts[2]

		// Process remaining parts
		for (let d of parts.slice(3)) {
			if (d === '(*)') {
				deduplicated = true
			} else if (d === '(proc-macro)') {
				procMacro = true
			} else if (d.startsWith('(') && d.endsWith(')')) {
				path = d.slice(1, -1) // Remove the surrounding parentheses
			}
		}

		return {
			name,
			version,
			path,
			procMacro,
			deduplicated
		}
	}

	lines.forEach(line => {
		determineSection(line)
		if (currentSection && (line.trim().startsWith('├──') || line.trim().startsWith('└──'))) {
			const parsedLine = parseLine(line)
			if (parsedLine) {
				result[currentSection][parsedLine.name] = parsedLine
			}
		}
	})

	return result
}