import { DependencyDiagnostic } from "@/entity"
import { Diagnostic, DiagnosticCollection, DiagnosticSeverity, languages, Range, Uri } from "vscode"

class DiagnosticStore {
	private collection: DiagnosticCollection
	private state: Map<string, Map<string, Diagnostic>> = new Map()

	constructor() {
		this.collection = languages.createDiagnosticCollection("crates-cmp")
	}

	add(path: string, range: Range, d: DependencyDiagnostic) {
		const m = this.state.get(path)
		if (m) {
			m.set(d.id, new Diagnostic(range, d.message, d.severity))
			return
		}
		const nm = new Map()
		nm.set(d.id, new Diagnostic(range, d.message, d.severity))
		this.state.set(path, nm)
	}

	delete(uri: Uri, id: string) {
		const m = this.state.get(uri.path)
		if (m) {
			const success = m.delete(id)
			if (success) {
				this.collection.set(uri, Array.from(m.values()))
			}
		}
	}

	render(uri: Uri) {
		const m = this.state.get(uri.path)
		if (m) {
			this.collection.set(uri, Array.from(m.values()))
		}
	}

	clear(uri: Uri) {
		if (this.state[uri.path]) {
			this.state[uri.path].length = 0
		}
	}
}

export const diagnosticStore = new DiagnosticStore()