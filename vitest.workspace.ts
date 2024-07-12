export default [
	{
		root: './src',
		plugins: ['vite-tsconfig-paths'],
		test: {
			alias: {
				'@/': new URL('./src/', import.meta.url).pathname,
			}
		}
	}
]