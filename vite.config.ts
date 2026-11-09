/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const HN_API_ORIGINS = ['https://node-hnapi.herokuapp.com', 'https://api.hnpwa.com'];

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // public/manifest.json is linked from index.html, so don't generate another one.
            manifest: false,
            includeAssets: ['favicon.ico', 'manifest.json'],
            workbox: {
                // ngsw "app" asset group (installMode: prefetch): precache the app shell.
                globPatterns: ['**/*.{html,js,css,ico,json}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    {
                        // ngsw "assets" asset group (installMode: lazy, updateMode: prefetch).
                        urlPattern: ({ url, sameOrigin }) =>
                            sameOrigin &&
                            (url.pathname.startsWith('/assets/') ||
                                /\.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/.test(url.pathname)),
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'assets' },
                    },
                    {
                        // Dynamic content: serve fresh API data, fall back to the last response when offline.
                        urlPattern: ({ url }) => HN_API_ORIGINS.includes(url.origin),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 5,
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // The theme SCSS is carried over unchanged from the Angular app.
                silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
