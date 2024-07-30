import { DependencyNode, VersionValue, VersionValueWithCtx, VersionState } from "@/entity"
import { metadata } from "@/repository"
import { satisfies, prerelease, major } from "semver"
import { Ctx } from "@/entity"

export function dependenciesDecorations(ctx: Ctx, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: Promise<VersionValueWithCtx>[] = []
	for (let d of input) {
		res.push(versionDecorations(ctx, d))
	}
	return res
}

//TODO input version start with =
async function versionDecorations(ctx: Ctx, input: DependencyNode): Promise<VersionValueWithCtx> {
	//get metadata
	let m = await metadata(ctx.extensionContext, input.name)

	if (!m[input.version.value]) {
		m = await metadata(ctx.extensionContext, input.name, true)
	}

	let res: VersionValue = {
		state: VersionState.UNKNOWN,
		...input.version,

	}

	//stable
	if (prerelease(res.installed!) === null) {
		//outdated
		if (res.installed !== m.latestStable) {
			res.latest = m.latestStable
			//return latest stable
			if (major(res.installed!) === major(m.latestStable)) {
				res.state = VersionState.OUTDATED
				return { ctx: ctx, version: res }
			} else {
				//return the max version that satisfy the input version
				for (let v of m.versions) {
					if (satisfies(v, res.installed!)) {
						res.currentMax = v
						if (res.currentMax === res.installed) {
							res.state = VersionState.LOCKED
						} else {
							res.state = VersionState.LOCK_AND_OUTDATED
						}
						return { ctx: ctx, version: res }
					}
				}
			}
		}
		res.state = VersionState.LATEST
		res.latest = m.latestStable
		return { ctx: ctx, version: res }
	}
	//pre release
	if (res.installed !== m.latestPrerelease) {
		res.state = VersionState.OUTDATED
		res.latest = m.latestPrerelease!
		//return latest prerelease
		if (satisfies(m.latestPrerelease!, res.installed!)) {
			return { ctx: ctx, version: res }
		} else {
			//return the max version that satisfy the input version
			for (let v of m.versions) {
				if (satisfies(v, res.installed!)) {
					res.currentMax = v
					if (res.currentMax === res.installed) {
						res.state = VersionState.LOCKED
					} else {
						res.state = VersionState.LOCK_AND_OUTDATED
					}
					return { ctx: ctx, version: res }
				}
			}
		}
		return { ctx: ctx, version: res }
	}
	res.state = VersionState.LATEST
	res.latest = m.latestPrerelease
	return { ctx: ctx, version: res }
}