import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'assets/icons/safari-pinned-tab.svg',
                'assets/icons/apple-touch-icon.png',
            ],
            manifest: {
                name: 'React HN',
                short_name: 'React HN',
                icons: [
                    { src: 'assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
                    { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                ],
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
            },
            workbox: {
                // App shell: precache built JS/CSS/HTML (equivalent to ngsw "app" assetGroup)
                globPatterns: ['**/*.{js,css,html,ico}'],
                // Assets: lazily cache images/fonts at runtime (equivalent to ngsw "assets" assetGroup)
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'assets',
                            expiration: { maxEntries: 100 },
                        },
                    },
                    {
                        urlPattern: /\.(?:eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'static-resources',
                            expiration: { maxEntries: 100 },
                        },
                    },
                ],
            },
        }),
    ],
});
