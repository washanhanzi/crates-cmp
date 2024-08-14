import { config, DependencyDecoration, VersionState, VersionValue } from "@/entity"
import { ColorThemeKind, Range, TextEditorDecorationType, window } from "vscode"

type DecorationState = {
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
		const dt = intoDecoration(deco)
		this.set(id, { decoration: dt })
		window.activeTextEditor?.setDecorations(dt, [range])
	}

	setLoading(id: string, range?: Range) {
		if (range === undefined) return
		this.decorateDependency(id, range, { text: "Waiting...", color: "grey" })
	}

	setNotInstalled(id: string, range?: Range) {
		if (range === undefined) return
		this.decorateDependency(id, range, { text: "Not Installed", color: "grey" })
	}

	setLocalDep(id: string, range?: Range) {
		if (range === undefined) return
		this.decorateDependency(id, range, { text: "Local", color: "grey" })
	}
}

export const decorationStore = new DecorationStore()

function intoDecoration(deco: DependencyDecoration) {
	return window.createTextEditorDecorationType({
		after: {
			contentText: deco.text,
			color: deco.color,
			margin: '0 0 0 4em' // Add some margin to the left
		}
	})
}

export function intoDependencyDecoration(version: VersionValue) {
	switch (version.state) {
		case VersionState.LATEST:
			return {
				text: '✅ ' + version.latest,
				color: latestColor()
			}
		case VersionState.OUTDATED:
			return {
				text: '⬆️ ' + version.installed + "==>" + version.latest,
				color: outdatedColor()
			}
		case VersionState.LOCKED:
			return {
				text: '🔒 ' + version.installed + ", " + version.latest,
				color: lockColor()
			}
		case VersionState.LOCK_AND_OUTDATED:
			return {
				text: '🔒 ' + version.installed + "==>" + version.currentMax + ", " + version.latest,
				color: lockColor()
			}
	}
}

function latestColor() {
	switch (config.getCurrentTheme()) {
		case ColorThemeKind.Light:
			return "#006400"
		case ColorThemeKind.HighContrastLight:
			return "#006400"
		case ColorThemeKind.Dark:
			return "green"
		case ColorThemeKind.HighContrast:
			return "green"
	}
}

function outdatedColor() {
	switch (config.getCurrentTheme()) {
		case ColorThemeKind.Light:
			return "#FF8C00"
		case ColorThemeKind.HighContrastLight:
			return "#FF8C00"
		case ColorThemeKind.Dark:
			return "yellow"
		case ColorThemeKind.HighContrast:
			return "yellow"
	}
}

function lockColor() {
	switch (config.getCurrentTheme()) {
		case ColorThemeKind.Light:
			return "#B8860B"
		case ColorThemeKind.HighContrastLight:
			return "#B8860B"
		case ColorThemeKind.Dark:
			return "orange"
		case ColorThemeKind.HighContrast:
			return "orange"
	}
}