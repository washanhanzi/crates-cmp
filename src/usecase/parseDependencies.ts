import { DependencyDecorationStatus, DependencyNode, DependencyOutput } from "@entity"
import { metadata } from "@repository"
import { DiagnosticSeverity, ExtensionContext } from "vscode"
import { satisfies, prerelease, major } from "semver"
import { Metadata } from "@entity"
import { matchingFeatures } from "./featuresCmp"

export function parseDependencies(ctx: ExtensionContext, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: Promise<DependencyOutput>[] = []
	for (let d of input) {
		if (d.currentVersion === "") {
			continue
		}
		res.push(parseDependency(ctx, d))
	}
	return res
}

async function parseDependency(ctx: ExtensionContext, input: DependencyNode): Promise<DependencyOutput> {
	//check if semver is valid
	//`even better toml` has done this for us

	//get metadata
	const m = await metadata(ctx, input.name)

	const versionCheck = checkVersion(input, m)
	//TODO check features

	return {
		id: input.id,
		name: input.name,
		decoration: versionCheck.decoration,
		diagnostics: versionCheck.diagnostics
	}
}

function checkVersion(input: DependencyNode, m: Metadata): DependencyOutput {
	const res: DependencyOutput = { id: input.id, name: input.name }

	//check if the user input version exist
	let exist = false
	for (let v of m.versions) {
		if (satisfies(v, input.inputVersion)) {
			exist = true
			break
		}
	}
	if (!exist) {
		//TODO return diagnostic, version not exist
		// res.diagnostics = [{
		// 	key: versionItemKey(input.name, input.version),
		// 	type: DependencyItemType.VERSION,
		// 	servity: DiagnosticSeverity.Error,
		// 	message: "Version not exist, latest stable: " + m.latestStable,
		// 	source: "extension: crates-cmp"
		// }]
		res.decoration = newErrorDecoration(input.id, "version not found")
		return res
	}


	//stable
	if (prerelease(input.currentVersion) === null) {
		//outdated
		if (input.currentVersion !== m.latestStable) {
			res.decoration = newOutdatedDecoration(input.id, input.currentVersion, m.latestStable)
			//return latest stable
			if (major(input.currentVersion) === major(m.latestStable)) {
				return res
			} else {
				//return the max version that satisfy the input version
				for (let v of m.versions) {
					if (satisfies(v, input.currentVersion)) {
						res.decoration.currentMax = v
						return res
					}
				}
			}
		}
		res.decoration = newLatestDecoration(input.id, m.latestStable)
	} else {
		//pre release
		//error no pre-release
		if (m.latestPrerelease === null) {
			//TODO return diagnostic, no pre-release
			res.decoration = newErrorDecoration(input.id, "pre-release not found")
			return res
		} else {
			if (input.currentVersion !== m.latestPrerelease) {
				res.decoration = newOutdatedDecoration(input.id, input.currentVersion, m.latestPrerelease)
				//return latest stable
				if (satisfies(input.inputVersion, m.latestPrerelease)) {
					return res
				} else {
					//return the max version that satisfy the input version
					for (let v of m.versions) {
						if (satisfies(v, input.inputVersion)) {
							res.decoration.currentMax = v
							return res
						}
					}
				}
				return res
			}
		}
		res.decoration = newLatestDecoration(input.id, m.latestPrerelease)
	}
	return res
}

function newLatestDecoration(id: string, latest: string) {
	return {
		id: id,
		status: DependencyDecorationStatus.LATEST,
		current: "",
		currentMax: "",
		latest: latest,
	}
}

function newOutdatedDecoration(id: string, current: string, latest: string) {
	return {
		id: id,
		status: DependencyDecorationStatus.OUTDATED,
		current: current,
		currentMax: "",
		latest: latest,
	}
}

//TODO use diagnostic
function newErrorDecoration(id: string, latest: string) {
	return {
		id: id,
		status: DependencyDecorationStatus.ERROR,
		current: "",
		currentMax: "",
		latest: latest,
	}
}

function checkFeatures(input: DependencyNode, m: Metadata) {
	const featurres = matchingFeatures(m, input.currentVersion)
}