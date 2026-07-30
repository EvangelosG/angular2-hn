/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The web app manifest is served as-is from public/manifest.json
      manifest: false,
      includeAssets: ['favicon.ico', 'manifest.json', 'assets/**/*'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,xml,json}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // The ported Angular stylesheets still use @import and slash division
        silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
