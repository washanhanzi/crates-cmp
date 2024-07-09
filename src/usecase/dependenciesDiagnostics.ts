import { DependencyDiagnostic, DependencyItemType, DependencyNode } from "@entity"
import { metadata } from "@repository"
import { satisfies } from "semver"
import { DiagnosticSeverity, ExtensionContext } from "vscode"

export async function dependenciesDiagnostics(ctx: ExtensionContext, input: DependencyNode[]) {
	if (input.length === 0) {
		return []
	}
	let res: DependencyDiagnostic[] = []
	for await (let d of input) {
		const m = await metadata(ctx, d.name, true)
		let satisfiedVersion: string | undefined = undefined
		for (let v of m.versions) {
			if (satisfies(v, d.inputVersion)) {
				satisfiedVersion = v
				break
			}
		}
		if (!satisfiedVersion) {
			res.push({
				id: d.id,
				type: DependencyItemType.VERSION,
				servity: DiagnosticSeverity.Error,
				source: "extension/crates-cmp",
				message: "Version not found, latest stable is " + m.latestStable
			})
		}
		if (satisfiedVersion && d.features.length !== 0) {
			for (let f of d.features) {
				if (!m.features[satisfiedVersion].includes(f)) {
					res.push({
						id: d.id,
						type: DependencyItemType.FEATURE,
						servity: DiagnosticSeverity.Error,
						source: "extension/crates-cmp",
						message: `Feature \"${f}\" not found, available features are ` + m.features[satisfiedVersion].join(", ")
					})
				}
			}
		}
	}
	return res
}