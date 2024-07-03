/**
 * Listener for TOML files.
 * Filters active editor files according to the extension.
 */
import { StatusBar } from "../ui/statusBar"
// import { status } from "../toml/command"
// import decorate, { decorationHandle } from "../ui/decorator"
import { TextEditor } from "vscode"




export async function parseAndDecorate(
	editor: TextEditor,
	_wasSaved: boolean = false,
	fetchDeps: boolean = true
) {
	const text = editor.document.getText()
	try {
		// Parse
		// StatusBar.setText("Loading", "Parsing Cargo.toml")
		// dependencies = parseToml(text)
		// if (fetchDeps || !fetchedDeps || !fetchedDepsMap) {
		// 	// const data = await fetchCrateVersions(dependencies)
		// 	// console.log("fetched data", data)
		// 	// fetchedDeps = await data[0]
		// 	// console.log("fetched deps", fetchedDeps)
		// 	// fetchedDepsMap = data[1]
		// }

		// decorate(editor, fetchedDeps)
		// // StatusBar.setText("Info", "Done");

	} catch (e) {
		// console.error(e)
		// StatusBar.setText("Error", "Cargo.toml is not valid!")
		// if (decorationHandle) {
		// 	decorationHandle.dispose()
		// }
	}
}

// export default async function listener(editor: TextEditor | undefined): Promise<void> {
// 	console.log("Listener")
// 	if (editor) {
// 		const { fileName } = editor.document
// 		if (fileName.toLocaleLowerCase().endsWith("cargo.toml")) {
// 			status.inProgress = true
// 			status.replaceItems = []
// 			StatusBar.show()
// 			await parseAndDecorate(editor)
// 		} else {
// 			StatusBar.hide()
// 		}
// 		status.inProgress = false
// 	} else {
// 		console.log("No active editor found.")
// 	}
// 	return Promise.resolve()
// }