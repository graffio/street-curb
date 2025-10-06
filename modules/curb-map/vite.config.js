import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    plugins: [react(), vanillaExtractPlugin()],
    server: {
        host: '0.0.0.0', // This allows access from any IP address
        port: 3000,
        allowedHosts: ['f5471af3d079.ngrok-free.app'],
        open: true,
    },
    build: {
        outDir: 'dist', // Set output directory to /dist
    },
})
