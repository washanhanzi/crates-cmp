const alphabet = "abcdefghijklmnopqrstuvwxyz"

export function sortString(i: number): string {
	// Validate input to ensure it's a non-negative integer
	if (i < 0 || !Number.isInteger(i)) {
		throw new Error("Input must be a non-negative integer.")
	}

	const columns = Math.floor(i / alphabet.length)
	const letter = alphabet[i % alphabet.length]

	// Use 'z' to repeat the correct number of times and append the letter
	return "z".repeat(columns) + letter
}