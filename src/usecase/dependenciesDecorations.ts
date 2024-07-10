import { DependencyDecorationStatus, DependencyNode, DependencyDecoration } from "@entity"
import { metadata } from "@repository"
import { ExtensionContext } from "vscode"
import { satisfies, prerelease, major } from "semver"

export function dependenciesDecorations(ctx: ExtensionContext, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: Promise<DependencyDecoration>[] = []
	for (let d of input) {
		if (d.currentVersion === undefined) {
			continue
		}
		res.push(dependencyDecoration(ctx, d))
	}
	return res
}

async function dependencyDecoration(ctx: ExtensionContext, input: DependencyNode): Promise<DependencyDecoration> {
	//get metadata
	let m = await metadata(ctx, input.name)

	if (!m[input.inputVersion]) {
		m = await metadata(ctx, input.name, true)
	}

	let res: DependencyDecoration = {
		id: input.id,
		current: input.currentVersion!,
		latest: "",
		status: DependencyDecorationStatus.UNKOWN
	}

	//stable
	if (prerelease(res.current) === null) {
		//outdated
		if (input.currentVersion !== m.latestStable) {
			res.status = DependencyDecorationStatus.OUTDATED
			res.latest = m.latestStable
			//return latest stable
			if (major(res.current) === major(m.latestStable)) {
				return res
			} else {
				//return the max version that satisfy the input version
				for (let v of m.versions) {
					if (satisfies(v, res.current)) {
						res.currentMax = v
						return res
					}
				}
			}
		}
		res.status = DependencyDecorationStatus.LATEST
		res.latest = m.latestStable
		return res
	}
	//pre release
	if (input.currentVersion !== m.latestPrerelease) {
		res.status = DependencyDecorationStatus.OUTDATED
		res.latest = m.latestPrerelease!
		//return latest stable
		if (satisfies(input.inputVersion, m.latestPrerelease!)) {
			return res
		} else {
			//return the max version that satisfy the input version
			for (let v of m.versions) {
				if (satisfies(v, input.inputVersion)) {
					res.currentMax = v
					return res
				}
			}
		}
		return res
	}
	res.status = DependencyDecorationStatus.LATEST
	res.latest = m.latestPrerelease
	return res
}