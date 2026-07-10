/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // Keep the existing hand-authored manifest.json (linked from index.html)
            // instead of generating a new web app manifest.
            manifest: false,
            injectRegister: 'auto',
            includeAssets: [
                'favicon.ico',
                'manifest.json',
                'assets/**/*',
            ],
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hnapi-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24,
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    build: {
        outDir: 'dist',
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: false,
    },
});
