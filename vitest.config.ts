import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	root: './src',
	plugins: [tsconfigPaths()],
	test: {
		alias: {
			'@/': new URL('./src/', import.meta.url).pathname,
		}
	}
}
)