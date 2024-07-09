import { DiagnosticSeverity } from "vscode"

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
	TARGET_DEPENDENCIES = "target.dependencies"
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
	currentVersion: string,
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
	ERROR = "Error"
}

export type DependencyOutput = {
	id: string,
	name: string,
	decoration?: DependencyDecoration,
	diagnostics?: DependencyDiagnostic[]
}

export type DependencyDecoration = {
	id: string,
	current: string,
	currentMax: string,
	latest: string,
	status: DependencyDecorationStatus
}

export type DependencyDiagnostic = {
	key: string,
	type: DependencyItemType
	servity: DiagnosticSeverity
	message: string
	source: string
}
