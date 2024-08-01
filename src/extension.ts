import { commands, DocumentSelector, ExtensionContext, languages, ShellExecution, Task, TaskDefinition, tasks, TaskScope, window, workspace } from 'vscode'
import { CratesCompletionProvider, Listener, rustAnalyzer } from '@/controller'
import { config } from "@/entity"
import { cargoTomlAction } from './controller/codeAction'
import { async } from '@washanhanzi/result-enum'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
	const documentSelector: DocumentSelector = { language: "toml", pattern: "**/Cargo.toml" }

	// const client = await async(rustAnalyzer.init())
	// if (client.isErr()) {
	// 	window.showErrorMessage(client.unwrapErr().message)
	// }

	workspace.onDidChangeConfiguration(config.onChange, config)

	const listener = new Listener(context)

	// const lockFileList = await workspace.findFiles("**/Cargo.lock")

	context.subscriptions.push(
		window.onDidChangeActiveTextEditor(listener.onDidChangeActiveEditor, listener),

		workspace.onDidSaveTextDocument(listener.onDidSaveTextDocument, listener),

		workspace.onDidCloseTextDocument(listener.onDidCloseTextDocument, listener),

		workspace.createFileSystemWatcher("**/Cargo.lock").onDidChange(listener.onDidLockFileChange, listener),

		languages.registerCodeActionsProvider(documentSelector, cargoTomlAction),

		// Register our versions completions provider
		languages.registerCompletionItemProvider(
			documentSelector,
			new CratesCompletionProvider(context),
			'"', '.', "+", "-",
			"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
		),
	)
}


// This method is called when your extension is deactivated
export function deactivate() {
	return rustAnalyzer.stop()
}
