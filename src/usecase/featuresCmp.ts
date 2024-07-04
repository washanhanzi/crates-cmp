import { metadata } from "@repository"
import { async } from "@washanhanzi/result-enum"
import { satisfies } from "semver"
import { ExtensionContext } from "vscode"

export async function featuresCmp(
	ctx: ExtensionContext,
	crateName: string,
	version: string,
	existedFeatures?: string[],
) {
	if (crateName === "") {
		return []
	}

	const resResult = await async(metadata(ctx, crateName))
	if (resResult.isErr()) {
		throw resResult.unwrapErr()
	}
	const res = resResult.unwrap()

	//version is empty, return the latest stable version's feature
	if (version === "") {
		return res.features[res.latestStable] ?? []
	}

	//find the features in version satisfies user input version
	let features = res.features[version] ?? []
	if (features.length === 0) {
		for (let v of res.versions) {
			if (satisfies(v, version)) {
				features = res.features[v] ?? []
				break
			}
		}
	}
	//can't find features
	if (features.length === 0) {
		return []
	}

	//filter existed features
	if (existedFeatures && existedFeatures.length !== 0) {
		const m = {}
		for (let f of existedFeatures) {
			m[f] = true
		}
		return features.filter(f => !m[f])
	}
	return features
}