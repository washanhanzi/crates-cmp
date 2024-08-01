import { execAsync } from "@/util"
import { CargoTable } from "@/entity"


type CargoTreeOutputItem = {
	name: string
	version: string
	path?: string
	procMacro?: boolean
	deduplicated?: boolean
}

export type ParsedCargoTreeOutput = {
	[CargoTable.DEPENDENCIES]: { [key: string]: CargoTreeOutputItem },
	[CargoTable.DEV_DEPENDENCIES]: { [key: string]: CargoTreeOutputItem },
	[CargoTable.BUILD_DEPENDENCIES]: { [key: string]: CargoTreeOutputItem },
	duplicated: Map<string, string[]>
}


export function parseCargoTreeOutput(input: string): ParsedCargoTreeOutput {
	const lines = input.split('\n')

	// Initialize a map for the structured data
	let result: ParsedCargoTreeOutput = {
		[CargoTable.DEPENDENCIES]: {},
		[CargoTable.BUILD_DEPENDENCIES]: {},
		[CargoTable.DEV_DEPENDENCIES]: {},
		duplicated: new Map()
	}

	let currentSection: CargoTable = CargoTable.DEPENDENCIES// Start with 'dependencies' as default

	// Determine the section based on a header line
	function determineSection(line: string) {
		const trimmedLine = line.trim()
		if (trimmedLine === "[build-dependencies]") {
			currentSection = CargoTable.BUILD_DEPENDENCIES
		} else if (trimmedLine === "[dev-dependencies]") {
			currentSection = CargoTable.DEV_DEPENDENCIES
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


	let depVersion = new Map<string, Set<string>>()
	lines.forEach(line => {
		determineSection(line)
		if (currentSection && (line.trim().startsWith('├──') || line.trim().startsWith('└──'))) {
			const parsedLine = parseLine(line)
			if (parsedLine) {
				result[currentSection][parsedLine.name] = parsedLine
				if (depVersion.has(parsedLine.name)) {
					depVersion.get(parsedLine.name)!.add(parsedLine.version)
				} else {
					depVersion.set(parsedLine.name, new Set([parsedLine.version]))
				}
			}
		}
	})

	for (let [k, v] of depVersion) {
		if (v.size > 1) {
			result.duplicated.set(k, Array.from(v))
		}
	}

	return result
}