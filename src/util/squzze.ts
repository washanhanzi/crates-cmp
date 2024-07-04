import { Range } from "vscode"

export function squezze(range: Range | undefined) {
	if (!range) {
		return range
	}
	return new Range(
		range.start.translate(0, 1)!,
		range.end.translate(0, -1)!,
	)
}