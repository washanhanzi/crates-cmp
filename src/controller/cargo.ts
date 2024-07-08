import { async } from "@washanhanzi/result-enum"
import { exec } from "child_process"
import { delay } from "util/delay"

function runCommand(command) {
	return new Promise((resolve, reject) => {
		exec(command, { timeout: 3000 }, (error, stdout, stderr) => {
			if (error) {
				reject(`error: ${error.message}`)
				return
			}
			if (stderr) {
				reject(`stderr: ${stderr}`)
				return
			}
			resolve(stdout)
		})
	})
}

export async function cargoTree(path: string): Promise<{ [key: string]: string } | undefined> {
	for (let counter = 0; counter < 3; counter++) {
		const tree = await async(runCommand(`cargo tree --manifest-path ${path} --depth 1`))
		console.log("waiting for cargo command")

		if (tree.isOk()) {
			return parseCargoTree(tree.unwrap() as string)
		}

		await delay(1000)
	}
	return undefined
}

function parseCargoTree(output: string) {
	const crateMap = {}
	const lines = output.trim().split('\n')

	lines.forEach(line => {
		const trimmedLine = line.trim()
		const match = trimmedLine.match(/(\S+)\s+v(\d+\.\d+\.\d+(\+\S+)?)/)
		if (match) {
			const [, crateName, version] = match
			crateMap[crateName] = version
		}
	})

	return crateMap
}