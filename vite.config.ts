import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['import', 'slash-div', 'color-functions', 'global-builtin'],
            },
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'script',
            manifest: false,
            devOptions: { enabled: false },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,xml}'],
                navigateFallback: 'index.html',
            },
        }),
    ],
});
