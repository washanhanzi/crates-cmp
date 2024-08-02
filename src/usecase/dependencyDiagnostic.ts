import { DependencyNode, FeatureState, Diagnostic, FeatureValue, validRange, Value, VersionState, VersionValue, VersionValueWithCtx } from "@/entity"
import { Ctx } from "@/entity"
import { metadata } from "@/repository"
import { async } from "@washanhanzi/result-enum"
import { gt, minVersion, prerelease, satisfies } from "semver"
import { DiagnosticSeverity, ExtensionContext } from "vscode"

type dependencisDiagnosticsOutput = {
	ctx: Ctx,
	version?: VersionValue
	feature?: FeatureValue
	crate?: Value & Diagnostic
}

export async function dependenciesDiagnostics(ctx: Ctx, input: DependencyNode[]): Promise<Array<dependencisDiagnosticsOutput>> {
	if (input.length === 0) {
		return []
	}
	let res: VersionValueWithCtx[] = []
	for await (let d of input) {
		const mResult = await async(metadata(ctx.extensionContext, d.name, false))
		if (mResult.isErr()) {
			//crate not found
			if (mResult.unwrapErr().message.startsWith("Request failed with status code 404 Not Found:")) {
				return [{
					ctx: ctx,
					crate: {
						id: d.id,
						dependencyId: d.id,
						value: d.name,
						severity: DiagnosticSeverity.Error,
						message: "Crate not found",
						source: "extension/crates-cmp"
					},
				}]
			}
			console.log("Sparse index request err: ", mResult.unwrapErr())
			return []
		}
		const m = mResult.unwrap()
		let satisfiedVersion: string | undefined = undefined
		//minimum version that satisfies the input version
		const minSatisfiedVersion = minVersion(d.version.value)
		//TODO no minimum version?
		if (!minSatisfiedVersion) { return [] }

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
				}
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
				}
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
				}
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
						}
					}]
				}
			}
		}
	}
	return []
}