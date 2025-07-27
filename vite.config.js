import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    plugins: [react()],
    server: {
        host: '0.0.0.0', // This allows access from any IP address
        port: 3000,
        allowedHosts: ['79d4e5f4a452.ngrok-free.app'],
        open: true,
    },
    build: {
        outDir: 'docs', // Set output directory to /docs
    },
})
