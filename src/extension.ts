import * as vscode from 'vscode'

import { DocumentSelector, ExtensionContext, TextDocumentChangeEvent, languages, window, workspace } from 'vscode'
import { CratesCompletions } from '@controller'


const CRATES_IO_SEARCH_URL = 'https://crates.io/api/v1/crates?page=1&per_page=10&q='
const CRATES_IO_CRATE_URL = (crate: string) => `https://crates.io/api/v1/crates/${crate}`

interface Crate {
	name: string,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	max_stable_version: string,
	description: string,
}
interface CrateVersion {
	num: string,
	yanked: boolean,
}

function isInDependencies(document: vscode.TextDocument, cursorLine: number): boolean {
	let regex = /^\s*\[(.+)\]/ig
	let line = cursorLine - 1
	let isInDependencies = false
	while (line > 0) {
		let attr = regex.exec(document.lineAt(line).text)
		if (attr) {
			isInDependencies = attr[1].includes('dependencies')
			break
		}
		line--
	}
	return isInDependencies
}

function getTextBeforeCursor(document: vscode.TextDocument, position: vscode.Position): string {
	const range = new vscode.Range(position.line, 0, position.line, position.character)
	return document.getText(range)
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	const documentSelector: DocumentSelector = { language: "toml", pattern: "**/[Cc]argo.toml" }


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "crates-cmp" is now active!')

	context.subscriptions.push(
		// Add active text editor listener and run once on start.
		// window.onDidChangeActiveTextEditor(tomlListener),

		// When the text document is changed, fetch + check dependencies
		workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
			// const { fileName } = e.document
			// if (fileName.toLocaleLowerCase().endsWith("cargo.toml")) {
			// 	if (!e.document.isDirty) {
			// 		tomlListener(window.activeTextEditor)
			// 	}
			// }
		}),


		// Register our versions completions provider
		languages.registerCompletionItemProvider(
			documentSelector,
			new CratesCompletions(context),
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
	// const nameProvider = vscode.languages.registerCompletionItemProvider(
	// 	documentSelector,
	// 	new CrateNameCompletionItemProvider(),
	// )

	// const versionProvider = vscode.languages.registerCompletionItemProvider(
	// 	documentSelector,
	// 	new CrateVersionCompletionItemProvider(),
	// )


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
