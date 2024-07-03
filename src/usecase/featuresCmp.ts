import { metadata } from "@repository"
import { async } from "@washanhanzi/result-enum"
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

	if (existedFeatures && existedFeatures.length !== 0) {
		const features = res.features[version] ?? []
		const m = {}
		for (let f of existedFeatures) {
			m[f] = true
		}
		return features.filter(f => !m[f])
	}
	if (version !== "" && res.features[version]) {
		return res.features[version]
	}
	if (res.versions.length !== 0) {
		return res.features[res.versions[res.versions.length - 1]] ?? []
	}
	return []
}