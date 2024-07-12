import { exec } from "child_process"

export function execAsync(command: string) {
	return new Promise((resolve, reject) => {
		const child = exec(command)
		let stdoutBuffer = ''
		let stderrBuffer = ''

		// Listen to 'stdout' data
		child.stdout?.on('data', (data) => {
			stdoutBuffer += data
		})

		// Listen to 'stderr' data
		child.stderr?.on('data', (data) => {
			stderrBuffer += data
		})

		// Handle process exit
		child.on('exit', (code) => {
			if (code === 0) {
				resolve(stdoutBuffer) // Resolve with stdout content if exit code is 0
			} else {
				reject(new Error(stderrBuffer))
			}
		})

		child.on('close', (code) => {
			if (code === 0) {
				resolve(stdoutBuffer)
			} else {
				reject(new Error(stderrBuffer || 'Unknown error'))
			}
		})

		// Handle process errors (e.g., command not found, etc.)
		child.on('error', (err) => {
			console.error('Failed to start subprocess:', err)
			reject(err)
		})
	})
}