import { ExtensionContext, window, TextDocument, TextEditor, Uri } from "vscode"
import { documentState } from "./documentState"
import { audit } from "./audit"


export class Listener {
	private ctx: ExtensionContext
	private state = documentState

	constructor(ctx: ExtensionContext) {
		this.ctx = ctx
	}

	async onDidSaveTextDocument(document: TextDocument) {
		if (
			document.fileName.endsWith("Cargo.toml")
		) {
			this.state.init(document)
			await this.state.parseDocument(this.ctx, document)
		}
	}

	async onDidChangeActiveEditor(editor: TextEditor | undefined) {
		if (this.state.path !== undefined) { this.state.reset() }
		if (!editor) return
		if (!editor.document.fileName.endsWith("Cargo.toml")) return

		this.state.init(editor.document)
		await this.state.parseDocument(this.ctx, editor.document)
	}

	async onDidLockFileChange(e: Uri) {

		audit.onLockFileChange(e)

		if (this.state.noResumeDepTree()) return

		await this.state.parseDependencies(this.ctx, window.activeTextEditor!.document)
	}

	onDidCloseTextDocument(document: TextDocument) {
		if (!document.fileName.endsWith("Cargo.toml")) return
		if (document.uri.path !== this.state.path) return
		this.state.reset()
	}
}