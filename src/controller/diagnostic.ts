import { Diagnostic, DiagnosticCollection, languages, Uri } from "vscode"

interface IDiagnosticState {
	equal(s: IDiagnosticState): boolean
}

type DiagnosticState<T> = {
	id: string,
	state: T
	diagnostic: Diagnostic
}

export class DiagnosticStore<T extends IDiagnosticState> {
	private collection: DiagnosticCollection
	private state: Map<string, Map<string, DiagnosticState<T>>> = new Map()

	constructor() {
		this.collection = languages.createDiagnosticCollection("crates-cmp")
	}

	add(path: string, d: DiagnosticState<T>) {
		const m = this.state.get(path)
		if (m) {
			m.set(d.id, d)
			return
		}
		const nm = new Map()
		nm.set(d.id, d)
		this.state.set(path, nm)
	}

	delete(uri: Uri, id: string) {
		const m = this.state.get(uri.path)
		if (m) {
			const success = m.delete(id)
			if (success) {
				const ds = Array.from(m.values()).map(m => m.diagnostic)
				this.collection.set(uri, ds)
			}
		}
	}

	render(uri: Uri) {
		const m = this.state.get(uri.path)
		if (m) {
			const ds = Array.from(m.values()).map(m => m.diagnostic)
			this.collection.set(uri, ds)
		} else {
			this.collection.set(uri, undefined)
		}
	}

	clear(uri: Uri, state?: T) {
		const m = this.state.get(uri.path)
		if (!m) return
		if (!state) {
			m.clear()
			this.render(uri)
			return
		}
		for (let [k, v] of m) {
			if (v.state.equal(state)) {
				m.delete(k)
			}
		}
		this.render(uri)

	}
}

export enum DiagnosticType {
	UNKOWN = "Unkown",
	DEPENDENCY = "Dependency",
	AUDIT = "Audit"

}

export class MyDiag implements IDiagnosticState {
	private state: DiagnosticType = DiagnosticType.UNKOWN

	constructor(state: DiagnosticType) {
		this.state = state
	}

	getState() {
		return this.state
	}

	equal(s: MyDiag): boolean {
		return this.state === s.getState()
	}

}


export const diagnosticStore = new DiagnosticStore<MyDiag>()