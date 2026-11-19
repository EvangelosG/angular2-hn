/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'script-defer',
            // public/manifest.json is linked from index.html and served as-is.
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,xml,json,woff,woff2}'],
                navigateFallback: '/index.html',
            },
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // The theme engine uses `/` for division and `darken()`; keep them working without warnings.
                silenceDeprecations: ['slash-div', 'global-builtin', 'color-functions', 'import'],
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
