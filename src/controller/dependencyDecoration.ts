import { DependencyDecorationStatus } from "@entity"
import { TextEditorDecorationType, window } from "vscode"

type DecorationState = {
	status: DependencyDecorationStatus,
	latest: string,
	decoration: TextEditorDecorationType
}

function latestDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '✅ ' + latest,
			color: 'green',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})

}

function outdatedDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '🟡 ' + latest,
			color: 'orange',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})
}

function errorDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '❌ ' + latest,
			color: 'red',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})
}
