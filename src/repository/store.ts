import { ExtensionContext } from "vscode"
import { sparseIndexMetadata } from "./crates"
import { Metadata } from "@/entity"

export async function metadata(ctx: ExtensionContext, crate: string, force: boolean = false) {
	const key = getKey(crate)
	if (force) {
		const m = await sparseIndexMetadata(crate)
		ctx.globalState.update(key, m)
		return m
	}
	const m: Metadata | undefined = ctx.globalState.get(key)
	if (!m || m.createdAt > new Date().getUTCMilliseconds() - 1000 * 60 * 10) {
		const m = await sparseIndexMetadata(crate)
		ctx.globalState.update(key, m)
		return m
	}
	return m as Metadata
}

function getKey(crate: string) {
	return `crates-cmp:metadata:${crate}`
}