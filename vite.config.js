import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    plugins: [react()],
    server: {
        host: '0.0.0.0', // This allows access from any IP address
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'docs', // Set output directory to /docs
    },
})
