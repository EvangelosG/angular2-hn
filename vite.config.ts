/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const hnApiCache = (urlPrefix: string, cacheName: string) => ({
    urlPattern: ({ url }: { url: URL }) => url.href.startsWith(urlPrefix),
    handler: 'NetworkFirst' as const,
    options: {
        cacheName,
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
    },
});

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,xml}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                    hnApiCache('https://node-hnapi.herokuapp.com/', 'hn-api'),
                    hnApiCache('https://api.hnpwa.com/', 'hn-user-api'),
                ],
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
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
