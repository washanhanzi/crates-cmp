import { DocumentSelector, ExtensionContext, languages, window, workspace } from 'vscode'
import { CratesCompletionProvider, Listener, rustAnalyzer } from '@controller'
import { async } from '@washanhanzi/result-enum'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
	const documentSelector: DocumentSelector = { language: "toml", pattern: "**/Cargo.toml" }

	// const client = await async(rustAnalyzer.init())
	// if (client.isErr()) {
	// 	window.showErrorMessage(client.unwrapErr().message)
	// }

	const listener = new Listener(context)

	context.subscriptions.push(
		// Add active text editor listener and run once on start.
		window.onDidChangeActiveTextEditor(listener.onDidChangeActiveEditor, listener),

		// When the text document is changed, fetch + check dependencies
		workspace.onDidChangeTextDocument(listener.onDidChangeTextDocument, listener),

		workspace.onDidCloseTextDocument(listener.onDidCloseTextDocument, listener),

		// Register our versions completions provider
		languages.registerCompletionItemProvider(
			documentSelector,
			new CratesCompletionProvider(context),
			'"', '.', "+", "-",
			"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
		),

		// TODO:  Register our Quick Actions provider
		// languages.registerCodeActionsProvider(
		//   documentSelector,
		//   new QuickActions(),
		//   { providedCodeActionKinds: [CodeActionKind.QuickFix] }
		// ),
	)
}


// This method is called when your extension is deactivated
export function deactivate() {
	return rustAnalyzer.stop()
}
