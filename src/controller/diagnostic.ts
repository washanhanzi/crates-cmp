import { DependencyDiagnostic } from "@/entity"
import { Diagnostic, DiagnosticCollection, DiagnosticSeverity, languages, Range, Uri } from "vscode"

export class DiagnosticStore {
	private collection: DiagnosticCollection
	private state: { [key: string]: Diagnostic[] } = {}

	constructor() {
		this.collection = languages.createDiagnosticCollection("crates-cmp")
	}

	addRaw(path: string, range: Range, d: DependencyDiagnostic) {
		if (this.state[path]) {
			this.state[path].push(new Diagnostic(range, d.message, d.severity))
			return
		}
		this.state[path] = [new Diagnostic(range, d.message, d.severity)]

	}

	add(path: string, ...d: Diagnostic[]) {
		if (this.state[path]) {
			this.state[path] = this.state[path].concat(d)
			return
		}
		this.state[path] = d
	}

	set(uri: Uri) {
		this.collection.set(uri, this.state[uri.path])
	}

	clear(uri: Uri) {
		if (this.state[uri.path]) {
			this.state[uri.path].length = 0
		}
	}

	clearSeverity(uri: Uri, severity: DiagnosticSeverity) {
		if (!this.state[uri.path]) return undefined
		this.state[uri.path] = this.state[uri.path].filter(d => d.severity !== severity)
		this.collection.set(uri, this.state[uri.path])
	}
}