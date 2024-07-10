import { DependencyDiagnostic, DependencyDiagnosticWithCtx, DependencyItemType, DependencyNode } from "@entity"
import { Ctx } from "@entity/ctx"
import { metadata } from "@repository"
import { satisfies } from "semver"
import { DiagnosticSeverity, ExtensionContext } from "vscode"

//TODO features specified dependencies not exist
export async function dependenciesDiagnostics(ctx: Ctx, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: DependencyDiagnosticWithCtx[] = []
	for await (let d of input) {
		const m = await metadata(ctx.extensionContext, d.name, true)
		let satisfiedVersion: string | undefined = undefined
		for (let v of m.versions) {
			if (satisfies(v, d.inputVersion)) {
				satisfiedVersion = v
				break
			}
		}
		if (!satisfiedVersion) {
			res.push({
				uri: ctx.path, version: ctx.version, diagnostic: {
					id: d.id,
					type: DependencyItemType.VERSION,
					servity: DiagnosticSeverity.Error,
					source: "extension/crates-cmp",
					message: "Version not found, latest stable is " + m.latestStable
				}
			})
		}
		if (satisfiedVersion && d.features.length !== 0) {
			for (let f of d.features) {
				if (!m.features[satisfiedVersion].includes(f)) {
					res.push({
						uri: ctx.path, version: ctx.version, diagnostic: {
							id: d.id,
							type: DependencyItemType.FEATURE,
							servity: DiagnosticSeverity.Error,
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