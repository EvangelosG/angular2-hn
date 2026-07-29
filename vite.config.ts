import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// The web app manifest is served as-is from public/manifest.json and linked from
// index.html, so the plugin only generates the Workbox service worker.
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: false,
            includeAssets: ['favicon.ico', 'manifest.json', 'assets/**/*'],
            workbox: {
                navigateFallback: 'index.html',
                globPatterns: ['**/*.{js,css,html,ico,png,svg,xml,json}'],
            },
        }),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
    },
});
