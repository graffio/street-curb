import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react(), vanillaExtractPlugin()],
    build: {
        lib: { entry: 'src/index.js', name: 'DesignSystem', fileName: 'index' },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
        },
    },
})
