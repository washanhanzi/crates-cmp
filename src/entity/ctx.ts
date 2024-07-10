import { ExtensionContext, Uri } from "vscode"

export type Ctx = {
	extensionContext: ExtensionContext,
	path: string,
	version: number
}