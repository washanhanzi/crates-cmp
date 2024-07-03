import { metadata } from "@repository"
import { ExtensionContext } from "vscode"

export async function versionCmp(ctx: ExtensionContext, crateName: string) {
	const res = await metadata(ctx, crateName)
	return res.versions
}