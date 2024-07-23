import { DependencyDecoration, DependencyDecorationStatus } from "@/entity"
import { Range, TextEditorDecorationType, window } from "vscode"

type DecorationState = {
	status: DependencyDecorationStatus,
	latest: string,
	decoration: TextEditorDecorationType
}

class DecorationStore {
	private path: string | undefined
	private state: { [key: string]: DecorationState }
	constructor() {
		this.state = {}
	}

	init(path: string) {
		if (this.path !== path) {
			this.state = {}
			this.path = path
			return
		}
	}

	reset() {
		this.state = {}
		this.path = undefined
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

	decorateDependency(id: string, range: Range, deco?: DependencyDecoration) {
		if (deco === undefined) {
			const d = this.get(id)
			if (d) {
				window.activeTextEditor?.setDecorations(d.decoration, [range])
			}
			return
		}
		const d = this.get(id)
		if (d) {
			d.decoration.dispose()
		}
		let dt
		switch (deco.status) {
			case DependencyDecorationStatus.LATEST:
				dt = latestDecoration(deco.latest)
				break
			case DependencyDecorationStatus.OUTDATED:
				dt = outdatedDecoration(deco)
				break
			case DependencyDecorationStatus.LOADING:
				dt = loadingDecoration()
				break
			case DependencyDecorationStatus.NOT_INSTALLED:
				dt = notInstalledDecoration()
				break
		}
		this.set(id, { latest: deco.latest, status: deco.status, decoration: dt })
		window.activeTextEditor?.setDecorations(dt, [range])
	}

	setLoading(id: string, range?: Range) {
		if (range === undefined) return
		this.decorateDependency(id, range, { id: id, latest: "", status: DependencyDecorationStatus.LOADING })
	}

	setNotInstalled(id: string, range?: Range) {
		if (range === undefined) return
		this.decorateDependency(id, range, { id: id, latest: "", status: DependencyDecorationStatus.NOT_INSTALLED })
	}
}

export const decorationStore = new DecorationStore()

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
				contentText: '🔒 ' + deco.current + ", " + deco.latest,
				color: 'orange',
				margin: '0 0 0 4em' // Add some margin to the left
			}
		})
	}
	if (deco.currentMax && deco.current !== deco.currentMax) {
		return window.createTextEditorDecorationType({
			after: {
				contentText: '⬆️ ' + deco.current + "==>" + deco.currentMax + ", " + deco.latest,
				color: 'yellow',
				margin: '0 0 0 4em' // Add some margin to the left
			}
		})
	}
	return window.createTextEditorDecorationType({
		after: {
			contentText: '⬆️ ' + deco.current + "==>" + deco.latest,
			color: 'yellow',
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

export function notInstalledDecoration() {
	return window.createTextEditorDecorationType({
		after: {
			contentText: 'Not Installed',
			color: 'grey',
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})
}