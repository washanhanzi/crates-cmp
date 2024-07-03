import { isEmpty } from "@entity"
import { Uri, commands } from "vscode"

export function executeCommand(command: string, uri: Uri) {
	return new Promise((resolve, reject) => {
		commands.executeCommand(command, uri)
			.then(
				res => {
					if (isEmpty(res)) reject("symbol provider undefined")
					resolve(res)
				},
				err => reject(err),
			)
	})

}