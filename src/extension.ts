import { DocumentSelector, ExtensionContext, TextDocumentChangeEvent, languages, window, workspace } from 'vscode'
import { CratesCompletionProvider, Listener } from '@controller'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	const documentSelector: DocumentSelector = { language: "toml", pattern: "**/Cargo.toml" }

	const listener = new Listener(context)

	context.subscriptions.push(
		// Add active text editor listener and run once on start.
		window.onDidChangeActiveTextEditor(listener.onDidChangeActiveEditor, listener),

		// When the text document is changed, fetch + check dependencies
		workspace.onDidChangeTextDocument(listener.onDidChangeTextDocument, listener),

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

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// const disposable = vscode.commands.registerCommand('crates-cmp.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from crates-cmp!')
	// })
	// context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() { }
