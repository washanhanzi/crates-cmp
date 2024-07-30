import { DependencyNode, FeatureState, FeatureValueWithCtx, validRange, VersionState, VersionValueWithCtx } from "@/entity"
import { Ctx } from "@/entity"
import { metadata } from "@/repository"
import { gt, minVersion, prerelease, satisfies } from "semver"
import { DiagnosticSeverity, ExtensionContext } from "vscode"

//TODO features specified dependency not exist
export async function dependenciesDiagnostics(ctx: Ctx, input: DependencyNode[]): Promise<Array<VersionValueWithCtx | FeatureValueWithCtx>> {
	if (input.length === 0) {
		return []
	}
	let res: VersionValueWithCtx[] = []
	for await (let d of input) {
		const m = await metadata(ctx.extensionContext, d.name, false)
		let satisfiedVersion: string | undefined = undefined
		//minimum version that satisfies the input version
		const minSatisfiedVersion = minVersion(d.version.value)
		//TODO no minimum version?
		if (!minSatisfiedVersion) { }

		//check prerelease
		let isPrerelease = false
		if (prerelease(minSatisfiedVersion!) !== null) isPrerelease = true

		//speed up the process by first checking the minium version > latest stable version
		//latest stable not satisfied
		if (!isPrerelease && gt(minSatisfiedVersion!, m.latestStable)) {
			return [{
				ctx: ctx,
				version: {
					latest: m.latestStable,
					state: VersionState.NOT_EXIST,
					diagnostic: {
						severity: DiagnosticSeverity.Error,
						source: "extension/crates-cmp",
						message: "Version not found, latest stable is " + m.latestStable
					},
					...d.version,
				},
			}]
		} else if (isPrerelease && !m.latestPrerelease) {
			//prerelease does not exist
			return [{
				ctx: ctx,
				version: {
					latest: m.latestStable,
					state: VersionState.NOT_EXIST,
					diagnostic: {
						severity: DiagnosticSeverity.Error,
						source: "extension/crates-cmp",
						message: "Prerelease not found, latest stable is " + m.latestStable
					},
					...d.version,
				},
			}]
		} else if (isPrerelease && gt(minSatisfiedVersion!, m.latestPrerelease!)) {
			//latest prerelease not satisfied
			return [{
				ctx: ctx,
				version: {
					latest: m.latestPrerelease!,
					state: VersionState.NOT_EXIST,
					diagnostic: {
						severity: DiagnosticSeverity.Error,
						source: "extension/crates-cmp",
						message: "Prerelease not found, latest prelease is " + m.latestStable
					},
					...d.version,
				},
			}]
		}
		else {
			for (let v of m.versions) {
				let r = d.version.value
				if (!validRange(r)) { r = "^" + r }
				if (v === d.version.value || satisfies(v, r)) {
					satisfiedVersion = v
					break
				}
			}
			if (!satisfiedVersion) {
				return [{
					ctx: ctx,
					version: {
						latest: m.latestStable!,
						state: VersionState.NOT_EXIST,
						diagnostic: {
							severity: DiagnosticSeverity.Error,
							source: "extension/crates-cmp",
							message: "Version not found, latest stable is " + m.latestStable
						},
						...d.version,
					},
				}]
			}
		}
		if (satisfiedVersion && d.features.length !== 0) {
			for (let f of d.features) {
				if (!m.features[satisfiedVersion].includes(f.value)) {
					return [{
						ctx: ctx,
						feature: {
							state: FeatureState.NOT_EXIST,
							diagnostic: {
								severity: DiagnosticSeverity.Error,
								source: "extension/crates-cmp",
								message: `Feature \"${f.value}\" not found, available features are ` + m.features[satisfiedVersion].join(", ")
							},
							...f
						},
					}]
				}
			}
		}
	}
	return res
}