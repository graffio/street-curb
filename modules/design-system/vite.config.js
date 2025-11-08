import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    build: {
        lib: { entry: 'src/index.js', name: 'DesignSystem', fileName: 'index' },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
        },
    },
})
