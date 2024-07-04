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
	id: string,
	name: string,
	version: string,
	features: string[]
	path?: string
	git?: string
	//dependencies, dev-dependencies, build-dependencies, target.dependencies
	tableName: DependenciesTable
	platform?: string
}

export function dependencyIdentifier(node: DependencyNode) {
	let identifier = node.tableName + ":"
	if (node.platform) {
		identifier += node.platform + ":"
	}
	return identifier + node.name
}

export enum DecorationStatus {
	LATEST = "Latest",
	OUTDATED = "Outdated",
	ERROR = "Error"
}

export type DependencyOutput = {
	id: string,
	name: string,
	dependencyIdentifier: string,
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

function dependencyItemKey(id: string, type: DependencyItemType, item?: string,) {
	switch (type) {
		case DependencyItemType.CRATE:
			return id + ":crate"
		case DependencyItemType.VERSION:
			return id + ":version:" + item!
		case DependencyItemType.FEATURE:
			return id + ":feature:" + item!
	}
}

export function crateItemKey(id: string) {
	return dependencyItemKey(id, DependencyItemType.CRATE)
}

export function versionItemKey(id: string, version: string) {
	return dependencyItemKey(id, DependencyItemType.VERSION, version)
}

export function featureItemKey(id: string, feature: string) {
	return dependencyItemKey(id, DependencyItemType.FEATURE, feature)
}


