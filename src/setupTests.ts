import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// Plain function, not vi.fn(): restoreMocks would wipe a vi.fn stub and SettingsProvider would crash.
window.matchMedia = (query: string) =>
    ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
    }) as unknown as MediaQueryList;

afterEach(() => {
    cleanup();
    localStorage.clear();
});
