import { DocumentSelector, ExtensionContext, languages, ShellExecution, Task, TaskDefinition, tasks, TaskScope, window, workspace } from 'vscode'
import { CratesCompletionProvider, Listener, rustAnalyzer } from '@/controller'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
	const documentSelector: DocumentSelector = { language: "toml", pattern: "**/Cargo.toml" }

	// const client = await async(rustAnalyzer.init())
	// if (client.isErr()) {
	// 	window.showErrorMessage(client.unwrapErr().message)
	// }

	let def: TaskDefinition = {
		type: "cargo",
		command: "update"
	}
	let task = new Task(def, TaskScope.Workspace, "cargo update", "crates-cmp", new ShellExecution("cargo update"))

	let taskc = tasks.registerTaskProvider("cargo", {
		provideTasks: () => { return [task] },
		resolveTask: (task, token) => { return task }
	})

	context.subscriptions.push(taskc)

	const listener = new Listener(context)

	//TODO consolidate Cargo.lock state with Cargo.toml state
	//for now, just open and close Cargo.toml file to update ui
	// const watcher = workspace.createFileSystemWatcher("**/Cargo.lock")
	// watcher.onDidChange((uri) => {
	// 	listener.onDidLockFileChange(uri)
	// })

	context.subscriptions.push(
		// Add active text editor listener and run once on start.
		window.onDidChangeActiveTextEditor(listener.onDidChangeActiveEditor, listener),

		// When the text document is changed, fetch + check dependencies
		workspace.onDidSaveTextDocument(listener.onDidChangeTextDocument, listener),

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
