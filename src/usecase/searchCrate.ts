import { crates } from "@/repository"

export async function searchCrate(query: string) {
	return crates(query)
}