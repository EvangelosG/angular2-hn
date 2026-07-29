import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia, which the settings layer uses for `prefers-color-scheme`.
if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
        ({
            media: query,
            matches: false,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }) as MediaQueryList;
}
