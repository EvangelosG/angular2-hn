/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.ico', 'manifest.json', 'assets/icons/**/*'],
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 4200,
        host: true,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test-setup.ts'],
    },
});
