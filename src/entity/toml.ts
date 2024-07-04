import { DiagnosticSeverity } from "vscode"

export enum TopLevelTable {
	PACKAGE = 'package',
	FEATURES = 'features',
	WORKSPACE = 'workspace',
	LIB = 'lib',
	BIN = 'bin',
	PROFILE = 'profile',
	BADGES = 'badges',
	OTHER = 'other'
}

export enum DependenciesTable {
	DEPENDENCIES = "dependencies",
	DEV_DEPENDENCIES = "dev-dependencies",
	BUILD_DEPENDENCIES = "build-dependencies",
	TARGET_DEPENDENCIES = "target.dependencies"
}

export type DependencyNode = {
	name: string,
	version: string,
	features: string[]
	path?: string
	git?: string
	//dependencies, dev-dependencies, build-dependencies, target.<platform>.dependencies
	tableName: DependenciesTable
	platform?: string
}

export enum DecorationStatus {
	LATEST = "Latest",
	OUTDATED = "Outdated",
	ERROR = "Error"
}

export type DependencyOutput = {
	name: string,
	decoration?: CrateDecoration,
	diagnostics?: DependencyDiagnostic[]
}

export type CrateDecoration = {
	key: string,
	latest: string,
	status: DecorationStatus
}

export type DependencyDiagnostic = {
	key: string,
	type: DependencyItemType
	servity: DiagnosticSeverity
	message: string
	source: string
}

export enum DependencyItemType {
	CRATE = "Crate",
	VERSION = "Version",
	FEATURE = "Feature"
}

function dependencyItemKey(crateName: string, type: DependencyItemType, item?: string,) {
	switch (type) {
		case DependencyItemType.CRATE:
			return crateName + ":crate"
		case DependencyItemType.VERSION:
			return crateName + ":version:" + item!
		case DependencyItemType.FEATURE:
			return crateName + ":feature:" + item!
	}
}

export function crateItemKey(crateName: string) {
	return dependencyItemKey(crateName, DependencyItemType.CRATE)
}

export function versionItemKey(crateName: string, version: string) {
	return dependencyItemKey(crateName, DependencyItemType.VERSION, version)
}

export function featureItemKey(crateName: string, feature: string) {
	return dependencyItemKey(crateName, DependencyItemType.FEATURE, feature)
}


