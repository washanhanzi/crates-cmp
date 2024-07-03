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
}