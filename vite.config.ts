/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setupTests.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        restoreMocks: true,
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
    },
});
