export class PromiseCache<T> {
	private cache: Map<string, Promise<T>>

	constructor() {
		this.cache = new Map()
	}

	call(key: string, asyncFunction: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
		if (this.cache.has(key)) {
			// Return the existing promise to avoid duplicate executions
			return this.cache.get(key)!
		}

		// Execute the async function with the provided arguments
		const promise = asyncFunction(...args)

		// Store the promise using the provided key
		this.cache.set(key, promise)

		// Remove the promise from the cache when it resolves or fails
		promise.finally(() => {
			this.cache.delete(key)
		})

		return promise
	}
}