export type Metadata = {
	name: string,
	versions: string[],
	//version->features
	features: {
		[key: string]: string[]
	},
	defaultFeatures: string[],
	//version->rustVersion
	rustVersion: {
		[key: string]: string[]
	},
	createdAt: number
	latestStable: string,
	latestPrerelease: string | null
}

export type SearchCrateOutput = {
	name: string
	max_version: string
	description: string
}