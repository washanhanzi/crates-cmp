import { DependencyDiagnostic, DependencyDiagnosticWithCtx, DependencyItemType, DependencyNode } from "@/entity"
import { Ctx } from "@/entity"
import { metadata } from "@/repository"
import { gt, minVersion, prerelease, satisfies } from "semver"
import { DiagnosticSeverity, ExtensionContext } from "vscode"

//TODO features specified dependency not exist
export async function dependenciesDiagnostics(ctx: Ctx, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: DependencyDiagnosticWithCtx[] = []
	for await (let d of input) {
		const m = await metadata(ctx.extensionContext, d.name, true)
		let satisfiedVersion: string | undefined = undefined
		//minimum version that satisfies the input version
		const minSatisfiedVersion = minVersion(d.inputVersion)
		//speed up the process by first checking the minium version > latest stable version
		if (gt(minSatisfiedVersion!, m.latestStable) && (m.latestPrerelease && gt(minSatisfiedVersion!, m.latestPrerelease))) {
			res.push({
				ctx: ctx,
				diagnostic: {
					id: d.id,
					type: DependencyItemType.VERSION,
					severity: DiagnosticSeverity.Error,
					source: "extension/crates-cmp",
					message: "Version not found, latest stable is " + m.latestStable
				}
			})
		} else {
			for (let v of m.versions) {
				if (satisfies(v, d.inputVersion)) {
					satisfiedVersion = v
					break
				}
			}
			if (!satisfiedVersion) {
				res.push({
					ctx: ctx,
					diagnostic: {
						id: d.id,
						type: DependencyItemType.VERSION,
						severity: DiagnosticSeverity.Error,
						source: "extension/crates-cmp",
						message: "Version not found, latest stable is " + m.latestStable
					}
				})
			}
		}
		if (satisfiedVersion && d.features.length !== 0) {
			for (let f of d.features) {
				if (!m.features[satisfiedVersion].includes(f)) {
					res.push({
						ctx: ctx,
						diagnostic: {
							id: d.id,
							type: DependencyItemType.FEATURE,
							severity: DiagnosticSeverity.Error,
							source: "extension/crates-cmp",
							message: `Feature \"${f}\" not found, available features are ` + m.features[satisfiedVersion].join(", ")
						}
					})
				}
			}
		}
	}
	return res
}