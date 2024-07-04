import { crateItemKey, DecorationStatus, DependencyItemType, DependencyNode, DependencyOutput, versionItemKey } from "@entity"
import { metadata } from "@repository"
import { DiagnosticSeverity, ExtensionContext } from "vscode"
import { satisfies, prerelease } from "semver"
import { Metadata } from "@entity"
import { matchingFeatures } from "./featuresCmp"

export function parseDependencies(ctx: ExtensionContext, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: Promise<DependencyOutput>[] = []
	for (let d of input) {
		if (d.version === "") {
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
		name: input.name,
		decoration: versionCheck.decoration,
		diagnostics: versionCheck.diagnostics
	}
}

function checkVersion(input: DependencyNode, m: Metadata): DependencyOutput {
	const res: DependencyOutput = { name: input.name }

	//check if the user input version exist
	let exist = false
	for (let v of m.versions) {
		if (satisfies(v, input.version)) {
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
		res.decoration = newErrorDecoration(input.name, "version not found")
		return res
	}

	//stable
	if (prerelease(input.version) === null) {
		//didn't satisfy
		if (!satisfies(m.latestStable, input.version)) {
			res.decoration = newOutdatedDecoration(input.name, m.latestStable)
			return res
		}
		res.decoration = newLatestDecoration(input.name, m.latestStable)
	} else {
		//pre release
		//error no pre-release
		if (m.latestPrerelease === null) {
			//TODO return diagnostic, no pre-release
			res.decoration = newErrorDecoration(input.name, "pre-release not found")
			return res
		} else {
			//didn't satisfy
			if (!satisfies(m.latestPrerelease, input.version)) {
				res.decoration = newOutdatedDecoration(input.name, m.latestPrerelease)
				return res
			}
		}
		res.decoration = newLatestDecoration(input.name, m.latestPrerelease)
	}
	return res
}

function newLatestDecoration(crateName: string, latest: string) {
	return {
		key: crateItemKey(crateName),
		status: DecorationStatus.LATEST,
		latest: latest,
	}
}

function newOutdatedDecoration(crateName: string, latest: string) {
	return {
		key: crateItemKey(crateName),
		status: DecorationStatus.OUTDATED,
		latest: latest,
	}
}

//TODO use diagnostic
function newErrorDecoration(crateName: string, latest: string) {
	return {
		key: crateItemKey(crateName),
		status: DecorationStatus.ERROR,
		latest: latest,
	}
}

function checkFeatures(input: DependencyNode, m: Metadata) {
	const featurres = matchingFeatures(m, input.version)
}