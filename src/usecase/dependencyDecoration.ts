import { DependencyDecorationStatus, DependencyNode, DependencyDecoration, DependencyDecorationWithCtx } from "@/entity"
import { metadata } from "@/repository"
import { satisfies, prerelease, major } from "semver"
import { Ctx } from "@/entity"

export function dependenciesDecorations(ctx: Ctx, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: Promise<DependencyDecorationWithCtx>[] = []
	for (let d of input) {
		res.push(dependencyDecoration(ctx, d))
	}
	return res
}

//TODO input version start with =
async function dependencyDecoration(ctx: Ctx, input: DependencyNode): Promise<DependencyDecorationWithCtx> {
	//get metadata
	let m = await metadata(ctx.extensionContext, input.name)

	if (!m[input.inputVersion]) {
		m = await metadata(ctx.extensionContext, input.name, true)
	}

	let res: DependencyDecoration = {
		id: input.id,
		current: input.currentVersion,
		latest: "",
		status: DependencyDecorationStatus.UNKOWN
	}

	if (!res.current) {
		res.status = DependencyDecorationStatus.NOT_INSTALLED
		return { ctx: ctx, decoration: res }
	}

	//stable
	if (prerelease(res.current) === null) {
		//outdated
		if (input.currentVersion !== m.latestStable) {
			res.status = DependencyDecorationStatus.OUTDATED
			res.latest = m.latestStable
			//return latest stable
			if (major(res.current) === major(m.latestStable)) {
				return { ctx: ctx, decoration: res }
			} else {
				//return the max version that satisfy the input version
				for (let v of m.versions) {
					if (satisfies(v, res.current)) {
						res.currentMax = v
						return { ctx: ctx, decoration: res }
					}
				}
			}
		}
		res.status = DependencyDecorationStatus.LATEST
		res.latest = m.latestStable
		return { ctx: ctx, decoration: res }
	}
	//pre release
	if (input.currentVersion !== m.latestPrerelease) {
		res.status = DependencyDecorationStatus.OUTDATED
		res.latest = m.latestPrerelease!
		//return latest prerelease
		if (satisfies(m.latestPrerelease!, res.current)) {
			return { ctx: ctx, decoration: res }
		} else {
			//return the max version that satisfy the input version
			for (let v of m.versions) {
				if (satisfies(v, res.current)) {
					res.currentMax = v
					return { ctx: ctx, decoration: res }
				}
			}
		}
		return { ctx: ctx, decoration: res }
	}
	res.status = DependencyDecorationStatus.LATEST
	res.latest = m.latestPrerelease
	return { ctx: ctx, decoration: res }
}