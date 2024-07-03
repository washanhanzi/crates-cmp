import { metadata } from "@repository"
import { async } from "@washanhanzi/result-enum"
import { ExtensionContext } from "vscode"

export async function versionCmp(ctx: ExtensionContext, crateName: string, version: string, existFeatures?: string[]) {

	if (crateName === "" || version === "") {
		return []
	}

	const resResult = await async(metadata(ctx, crateName))
	if (resResult.isErr()) {
		throw resResult.unwrapErr()
	}
	const res = resResult.unwrap()

	if (existFeatures && existFeatures.length !== 0) {
		const features = res.features[version] ?? []
		const m = {}
		for (let f of existFeatures) {
			m[f] = true
		}
		return features.filter(f => !m[f])
	}
	return res.features[version] ?? []
}