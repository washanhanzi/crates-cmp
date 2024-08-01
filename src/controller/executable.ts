//https://github.com/rust-lang/rust-analyzer/blob/master/editors/code/src/toolchain.ts

import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'

type ExecutableName = "cargo" | "rustc" | "rustup"

const cachedPaths: Partial<Record<ExecutableName, Promise<string>>> = {}

export async function cargoPath(): Promise<string> {
    const env: Record<string, string> = { RUST_BACKTRACE: "short" }
    Object.assign(env, process.env)
    if (env["RUSTC_TOOLCHAIN"]) {
        return "cargo"
    }
    return getPathForExecutable("cargo")
}

async function getPathForExecutable(executableName: ExecutableName): Promise<string> {
    if (!cachedPaths[executableName]) {
        cachedPaths[executableName] = findExecutablePath(executableName)
    }
    return cachedPaths[executableName]!
}

async function findExecutablePath(executableName: ExecutableName): Promise<string> {
    const envPath = process.env[executableName.toUpperCase()]
    if (envPath) return envPath

    if (await isExecutableInPath(executableName)) return executableName

    const cargoHome = getCargoHome()
    if (cargoHome) {
        const standardPath = vscode.Uri.joinPath(cargoHome, "bin", executableName)
        if (await isFileAtUri(standardPath)) return standardPath.fsPath
    }

    return executableName
}

async function isExecutableInPath(exec: string): Promise<boolean> {
    const paths = process.env["PATH"]?.split(path.delimiter) || []
    const candidates = paths.flatMap(dirInPath => {
        const candidate = path.join(dirInPath, exec)
        return os.type() === "Windows_NT" ? [candidate, `${candidate}.exe`] : [candidate]
    })

    return (await Promise.all(candidates.map(isFileAtPath))).some(Boolean)
}

function getCargoHome(): vscode.Uri | null {
    const cargoHomeEnv = process.env["CARGO_HOME"]
    if (cargoHomeEnv) return vscode.Uri.file(cargoHomeEnv)

    try {
        return vscode.Uri.joinPath(vscode.Uri.file(os.homedir()), ".cargo")
    } catch (err) {
        console.error("Failed to read the fs info", err)
        return null
    }
}

async function isFileAtPath(path: string): Promise<boolean> {
    return isFileAtUri(vscode.Uri.file(path))
}

async function isFileAtUri(uri: vscode.Uri): Promise<boolean> {
    try {
        const stat = await vscode.workspace.fs.stat(uri)
        return (stat.type & vscode.FileType.File) !== 0
    } catch {
        return false
    }
}