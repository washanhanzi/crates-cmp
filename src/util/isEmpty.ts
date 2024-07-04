export function isEmpty(value) {
	if (value === undefined) {
		return true // Treat undefined as having zero length
	} else if (typeof value === 'string' || Array.isArray(value)) {
		// Check for string and array
		return value.length === 0
	} else if (typeof value === 'object' && value !== null) {
		// Check for object (excluding null)
		return Object.keys(value).length === 0
	}
	// Other types do not have a length property
	return false
}