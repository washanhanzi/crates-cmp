import { resolve } from "node:path/win32"
import { extensions } from "vscode"
import { LanguageClient } from "vscode-languageclient/node"

type Dependency = {
	name: string,
	version: string
}

class RustAnalyzer {
	private client: LanguageClient | undefined = undefined
	private dependencies: { [key: string]: Dependency } = {}

	async init() {
		const extension = extensions.getExtension('rust-lang.rust-analyzer')
		if (!extension) {
			throw new Error('Require Rust Analyzer')
		}
		// Activate the rust-analyzer extension to access its exports
		const exports = await extension!.activate()
		if (!exports.client) {
			throw new Error('Require Rust Analyzer')
		}
		exports.client.start()
		this.client = exports.client
	}

	stop() {
		if (this.client) {
			return this.client.stop()
		}
	}

	async dependencyList() {
		const deps = await this.client?.sendRequest('rust-analyzer/fetchDependencyList', {}) as { crates: Dependency[] }
		for (let d of deps.crates) {
			this.dependencies[d.name] = d
		}
	}

	dependency(name: string) {
		return this.dependencies[name]
	}

	languageClient() {
		return this.client
	}
}


export const rustAnalyzer = new RustAnalyzer()