/// <reference types="vite/client" />

interface Window {
    /** Google Analytics (analytics.js), loaded by index.html */
    ga?: (...args: unknown[]) => void;
}
