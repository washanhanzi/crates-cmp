import { ExtensionContext } from "vscode"
import { sparseIndexMetadata } from "./crates"
import { Metadata } from "@entity/crates"

export async function metadata(ctx: ExtensionContext, crate: string, force: boolean = false) {
	const key = getKey(crate)
	if (force) {
		const m = await sparseIndexMetadata(crate)
		ctx.globalState.update(key, m)
		return m
	}
	const m: Metadata | undefined = ctx.globalState.get(key)
	//TODO better caching
	if (!m || m.createdAt > new Date().getUTCMilliseconds() - 1000 * 60 * 30) {
		const m = await sparseIndexMetadata(crate)
		ctx.globalState.update(key, m)
		return m
	}
	return m as Metadata
}

function getKey(crate: string) {
	return `crates-cmp:metadata:${crate}`
}