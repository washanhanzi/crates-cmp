import { ConfigurationChangeEvent, workspace } from "vscode"

const SECTION = "crates-cmp"
const SPARSE_INDEX_CONFIG = "crates.sparse-index.url"

class Config {
    private sparseIndexUrl: string = "https://index.crates.io"

    constructor() {
        this.updateSparseIndexUrl()
    }

    getSparseIndexUrl() {
        return this.sparseIndexUrl
    }

    updateSparseIndexUrl() {
        const sparseIndexUrl = workspace.getConfiguration("crates-cmp").get(SPARSE_INDEX_CONFIG)
        if (typeof sparseIndexUrl === "string") {
            this.sparseIndexUrl = sparseIndexUrl
        }
    }

    onChange(e: ConfigurationChangeEvent) {
        if (e.affectsConfiguration(SECTION + "." + SPARSE_INDEX_CONFIG)) {
            this.updateSparseIndexUrl()
        }
    }
}

export const config = new Config()