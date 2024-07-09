import { DependencyDecoration, DependencyDecorationStatus } from "@entity"
import { TextEditorDecorationType, window } from "vscode"

type DecorationState = {
	status: DependencyDecorationStatus,
	latest: string,
	decoration: TextEditorDecorationType
}

export class DecorationStore {
	private uri: string | undefined
	private state: { [key: string]: DecorationState }
	constructor() {
		this.state = {}
	}

	init(uri: string) {
		if (this.uri !== uri) {
			this.state = {}
			this.uri = uri
			return
		}
	}

	delete(id: string) {
		if (this.state[id]) {
			this.state[id].decoration.dispose()
			delete this.state[id]
		}
	}

	get(id: string) {
		return this.state[id]
	}

	set(id: string, state: DecorationState) {
		this.state[id] = state
	}
}

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

export function loadingDecoration() {
	return window.createTextEditorDecorationType({
		after: {
			contentText: 'Waiting...',
			color: 'grey',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})
}