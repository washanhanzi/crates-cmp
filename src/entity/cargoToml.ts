import { Range } from "vscode"

export enum CargoTable {
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

export enum DependencyKey {
	CRATE = "crate",
	VERSION = "version",
	FEATURE = "feature",
	PATH = "path",
	GIT = "git",
	PACKAGE = "package",
	SIMPLE_VERSION = "simpleVersion",
	UNKOWN = "unkown"
}

export type DocumentNode = {
	id: string,
	table: CargoTable,
	dependency?: DocumentDependencyNode,
	value: string,
	range: Range
}


export type DocumentDependencyNode = {
	dependencyId: string,
	key: DependencyKey
}

