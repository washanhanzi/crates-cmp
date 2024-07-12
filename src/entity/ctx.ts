import { ExtensionContext, Uri } from "vscode"

export type Ctx = {
	extensionContext: ExtensionContext,
	uri: Uri,
	path: string,
	rev: number
}