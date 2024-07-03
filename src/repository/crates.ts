import { addQuotes } from '@entity'
import { Metadata } from '@entity/crates'
import ky from "ky"

export const DEFAULT_SPARSE_INDEX_SERVER_URL = "https://index.crates.io"

export async function sparseIndexMetadata(name: string, url: string = DEFAULT_SPARSE_INDEX_SERVER_URL): Promise<Metadata> {

	// clean dirty names
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
	for (let d of jsonLinesArr) {
		let j = JSON.parse(d)
		if (j.yanked === false) {
			const quotedVersion = addQuotes(j.vers)
			versions.push(quotedVersion)
			if (j.rust_version) {
				rustVersion[j.vers] = j.rust_version
			}
			features[quotedVersion] = Object.keys(j.features)
				.filter(f => {
					if (f === "default") {
						defaultFeatures = j.features["default"].map(f => addQuotes(f))
						return false
					}
					return true
				})
				.map(f => addQuotes(f))
		}
	}
	//reverse versions array
	versions = versions.reverse()
	return {
		name: name,
		versions: versions,
		features: features,
		defaultFeatures: defaultFeatures,
		rustVersion: rustVersion,
		createdAt: new Date().getUTCMilliseconds()
	}
}

