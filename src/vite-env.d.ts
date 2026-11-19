/// <reference types="vite/client" />

interface Window {
    /** Google Analytics (analytics.js), loaded from index.html. */
    ga?: (...args: unknown[]) => void;
}
