import { DiagnosticSeverity, Range } from "vscode"
import { Ctx } from "./ctx"

export enum CargoTomlTable {
	PACKAGE = 'package',
	FEATURES = 'features',
	WORKSPACE = 'workspace',
	LIB = 'lib',
	BIN = 'bin',
	PROFILE = 'profile',
	BADGES = 'badges',
	OTHER = 'other',
	DEPENDENCIES = "dependencies",
	DEV_DEPENDENCIES = "dev-dependencies",
	BUILD_DEPENDENCIES = "build-dependencies",
}

export enum DependencyItemType {
	CRATE = "Crate",
	VERSION = "Version",
	FEATURE = "Feature",
	UNKOWN = "Unkown"
}

export type DependencyNode = {
	id: string,
	name: string,
	//icns = { package = "tauri-icns", version = "0.1" }
	packageName?: string,
	inputVersion: string
	currentVersion?: string,
	features: string[]
	path?: string
	git?: string
	//dependencies, dev-dependencies, build-dependencies, target.dependencies
	tableName: CargoTomlTable
	platform?: string
}

export enum DependencyDecorationStatus {
	LATEST = "Latest",
	OUTDATED = "Outdated",
	LOADING = "Loading",
	NOT_INSTALLED = "Not Installed",
	UNKOWN = "Unkown"
}

export type DependencyDecorationWithCtx = {
	ctx: Ctx
	decoration: DependencyDecoration
}

export type DependencyDecoration = {
	id: string,
	current?: string,
	currentMax?: string,
	latest: string,
	status: DependencyDecorationStatus
}

export type DependencyDiagnosticWithCtx = {
	ctx: Ctx,
	diagnostic: DependencyDiagnostic
}


export type DependencyDiagnostic = {
	id: string,
	type: DependencyItemType
	severity: DiagnosticSeverity
	message: string
	source: string
}
