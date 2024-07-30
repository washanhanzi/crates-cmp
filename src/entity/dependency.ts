import { DiagnosticSeverity } from "vscode"
import { Ctx } from "./ctx"
import { CargoTable, DependencyKey } from "./cargoToml"
import { E } from "vitest/dist/reporters-yx5ZTtEV.js"

type Value = {
    id: string,
    //refer to the id in DependencyNode
    dependencyId: string,
    value: string,
}

export enum VersionState {
    LATEST = "Latest",
    OUTDATED = "Outdated",
    LOCK_AND_OUTDATED = "LockandNotOutdated",
    LOCKED = "Locked",
    NOT_EXIST = "NotExist",
    UNKNOWN = "Unknown",

}

export type Diagnostic = {
    severity: DiagnosticSeverity
    message: string
    source: string
}

export type VersionValueWithCtx = {
    ctx: Ctx
    version: VersionValue
}

export type VersionValue = {
    latest?: string
    currentMax?: string
    state?: VersionState
    diagnostic?: Diagnostic
    //current installed version
    installed?: string,
} & Value

export enum FeatureState {
    NOT_EXIST = "NotExist",
    UNKNOWN = "Unknown",
}

export type FeatureValue = {
    state?: FeatureState
    diagnostic?: Diagnostic
} & Value

export type FeatureValueWithCtx = {
    ctx: Ctx
    feature: FeatureValue
}

export type DependencyNode = {
    id: string,
    name: string,
    //icns = { package = "tauri-icns", version = "0.1" }
    packageName?: string,
    //user input version
    version: VersionValue
    features: FeatureValue[]
    path?: Value
    git?: Value
    //dependencies, dev-dependencies, build-dependencies, target.dependencies
    table: CargoTable
    platform?: string
}

export type DependencyDecoration = {
    text: string,
    color: string,
}

export type DependencyDiagnostic = {
    id: string,
    severity: DiagnosticSeverity,
    message: string,
}
