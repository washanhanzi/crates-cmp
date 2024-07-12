import { Metadata, SearchCrateOutput } from '@/entity'
import ky from "ky"
import { prerelease, satisfies } from "semver"

export const DEFAULT_SPARSE_INDEX_SERVER_URL = "https://index.crates.io"

export async function sparseIndexMetadata(name: string, url: string = DEFAULT_SPARSE_INDEX_SERVER_URL): Promise<Metadata> {
	// clean dirty names
	// TODO is this neccessary?
	let lowerName = name.replace(/"/g, "").toLocaleLowerCase()

	let prefix = ""
	if (lowerName.length <= 2) {
		prefix = lowerName.length.toString()
	} else if (lowerName.length === 3) {
		prefix = "3/" + lowerName.substring(0, 1)
	} else {
		prefix = lowerName.substring(0, 2) + "/" + lowerName.substring(2, 4)
	}

	const response = await ky.get(`${url}/${prefix}/${lowerName}`)
	if (response.status !== 200) {
		throw new Error(`get crates metadata error: statusCode=${response.status} ${await response.text()}`)
	}

	const jsonLinesArr = (await response.text()).split('\n').filter(n => n)

	let versions: string[] = []
	let features: { [key: string]: string[] } = {}
	let rustVersion: { [key: string]: string[] } = {}
	let defaultFeatures: string[] = []

	let stable: string | null = null
	let pre: string | null = null

	//reverse loop jsonLinesArr
	for (let i = jsonLinesArr.length - 1; i >= 0; i--) {
		let j = JSON.parse(jsonLinesArr[i])
		if (j.yanked === false) {
			versions.push(j.vers)

			//find latest version
			if (stable === null && prerelease(j.vers) === null) {
				stable = j.vers
			} else if (pre === null && prerelease(j.vers) !== null) {
				pre = j.vers
			}

			if (j.rust_version) {
				rustVersion[j.vers] = j.rust_version
			}
			const f1 = Object.keys(j.features)
				.filter(f => {
					if (f === "default") {
						defaultFeatures = j.features["default"]
						return false
					}
					return true
				})
			let f2: string[] = []
			if (j.features2) {
				f2 = Object.keys(j.features2)
			}
			features[j.vers] = [...f1, ...f2]
			for (let dep of j.deps) {
				if (dep.optional && satisfies(j.vers, dep.req)) {
					features[j.vers].push(dep.name)
				}
			}
		}
	}

	return {
		name: name,
		versions: versions,
		features: features,
		defaultFeatures: defaultFeatures,
		rustVersion: rustVersion,
		createdAt: new Date().getUTCMilliseconds(),
		latestStable: stable!,
		latestPrerelease: pre
	}
}

type SearchCrateResponse = {
	crates: SearchCrateOutput[]
}

export async function crates(query: string): Promise<SearchCrateOutput[]> {
	if (query === "") {
		return []
	}
	const res = await ky.get(
		"https://crates.io/api/v1/crates?page=1&per_page=30&q=" + query,
		{
			headers: { "User-Agent": "VSCodeExtension/crates-cmp" }
		},
	)
	if (res.status !== 200) {
		throw new Error(`search crate error: statusCode=${res.status} ${await res.text()}`)
	}
	const j = await res.json() as SearchCrateResponse
	return j.crates
}

