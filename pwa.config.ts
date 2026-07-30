import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa';

export const API_ORIGIN = 'https://node-hnapi.herokuapp.com';

export const manifest: Partial<ManifestOptions> = {
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
};

export const pwaOptions: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
    // Icons are already precached by the workbox glob patterns below; letting the plugin add
    // them again would create conflicting precache entries and abort the whole precache.
    includeManifestIcons: false,
    manifest,
    workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,xml,webmanifest}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
            {
                urlPattern: new RegExp(`^${API_ORIGIN.replace(/[.]/g, '\\.')}/.*$`),
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'hn-api',
                    networkTimeoutSeconds: 10,
                    expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
                    cacheableResponse: { statuses: [0, 200] },
                },
            },
        ],
    },
};
