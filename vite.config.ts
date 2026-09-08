import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vitejs.dev/config/
// `vite-plugin-pwa` (Workbox) replaces Angular's `ngsw-worker.js` / ngsw-config.json.
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // public/manifest.json is kept for reference; the manifest below is generated
            // by the plugin and injected into index.html.
            manifestFilename: 'manifest.webmanifest',
            includeAssets: ['favicon.ico', 'assets/icons/*.png', 'assets/icons/*.svg', 'assets/images/*'],
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                description: 'A Hacker News client built with React, TypeScript and Vite',
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
                icons: [
                    { src: 'assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        // Hacker News API — same "freshness" strategy as the old ngsw dataGroup.
                        urlPattern: /^https:\/\/node-hnapi\.herokuapp\.com\/.*$/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api-cache',
                            networkTimeoutSeconds: 10,
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        modules: {
            // Exposes both the original kebab-case key and a camelCase alias,
            // so `styles['comment-box']` and `styles.commentBox` both work.
            localsConvention: 'camelCase',
        },
    },
    server: {
        port: 4200,
    },
    build: {
        outDir: 'dist',
    },
});
