import path from "path"
import os from "os"
import { ConfigurationChangeEvent, FileType, Uri, workspace } from "vscode"

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

async function lookupInPath(exec: string): Promise<boolean> {
    const paths = process.env["PATH"] ?? ""

    const candidates = paths.split(path.delimiter).flatMap((dirInPath) => {
        const candidate = path.join(dirInPath, exec)
        return os.type() === "Windows_NT" ? [candidate, `${candidate}.exe`] : [candidate]
    })

    for await (const isFile of candidates.map(isFileAtPath)) {
        if (isFile) {
            return true
        }
    }
    return false
}

function isFileAtPath(path: string): Promise<boolean> {
    return isFileAtUri(Uri.file(path))
}

async function isFileAtUri(uri: Uri): Promise<boolean> {
    try {
        return ((await workspace.fs.stat(uri)).type & FileType.File) !== 0
    } catch {
        return false
    }
}

export const config = new Config()
