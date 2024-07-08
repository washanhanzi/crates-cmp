import { DependencyDecoration, DependencyDecorationStatus } from "@entity"
import { TextEditorDecorationType, window } from "vscode"


export function latestDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '✅ ' + latest,
			color: 'green',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})

}

export function outdatedDecoration(deco: DependencyDecoration) {
	if (deco.currentMax !== "" && deco.current === deco.currentMax) {
		return window.createTextEditorDecorationType({
			after: {
				contentText: '🟡 ' + deco.current + ", " + deco.latest,
				color: 'orange',
				margin: '0 0 0 4em' // Add some margin to the left
			}
		})
	}
	if (deco.currentMax !== "" && deco.current !== deco.currentMax) {
		return window.createTextEditorDecorationType({
			after: {
				contentText: '🟡 ' + deco.current + "==>" + deco.currentMax + ", " + deco.latest,
				color: 'orange',
				margin: '0 0 0 4em' // Add some margin to the left
			}
		})
	}
	return window.createTextEditorDecorationType({
		after: {
			contentText: '🟡 ' + deco.current + "==>" + deco.latest,
			color: 'orange',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})
}

export function errorDecoration(latest: string) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: '❌ ' + latest,
			color: 'red',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})
}
