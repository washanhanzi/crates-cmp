import { DependencyDecorationStatus, DependencyNode, DependencyDecoration, DependencyDecorationWithCtx } from "@entity"
import { metadata } from "@repository"
import { ExtensionContext } from "vscode"
import { satisfies, prerelease, major } from "semver"
import { Ctx } from "@entity/ctx"

export function dependenciesDecorations(ctx: Ctx, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: Promise<DependencyDecorationWithCtx>[] = []
	for (let d of input) {
		if (d.currentVersion === undefined) {
			continue
		}
		res.push(dependencyDecoration(ctx, d))
	}
	return res
}

//TODO input version is =
async function dependencyDecoration(ctx: Ctx, input: DependencyNode): Promise<DependencyDecorationWithCtx> {
	//get metadata
	let m = await metadata(ctx.extensionContext, input.name)

	if (!m[input.inputVersion]) {
		m = await metadata(ctx.extensionContext, input.name, true)
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
				return { uri: ctx.path, version: ctx.version, decoration: res }
			} else {
				//return the max version that satisfy the input version
				for (let v of m.versions) {
					if (satisfies(v, res.current)) {
						res.currentMax = v
						return { uri: ctx.path, version: ctx.version, decoration: res }
					}
				}
			}
		}
		res.status = DependencyDecorationStatus.LATEST
		res.latest = m.latestStable
		return { uri: ctx.path, version: ctx.version, decoration: res }
	}
	//pre release
	if (input.currentVersion !== m.latestPrerelease) {
		res.status = DependencyDecorationStatus.OUTDATED
		res.latest = m.latestPrerelease!
		//return latest prerelease
		if (satisfies(m.latestPrerelease!, res.current)) {
			return { uri: ctx.path, version: ctx.version, decoration: res }
		} else {
			//return the max version that satisfy the input version
			for (let v of m.versions) {
				if (satisfies(v, res.current)) {
					res.currentMax = v
					return { uri: ctx.path, version: ctx.version, decoration: res }
				}
			}
		}
		return { uri: ctx.path, version: ctx.version, decoration: res }
	}
	res.status = DependencyDecorationStatus.LATEST
	res.latest = m.latestPrerelease
	return { uri: ctx.path, version: ctx.version, decoration: res }
}