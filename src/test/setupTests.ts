import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Plain functions (not vi.fn) so `restoreMocks` / vi.restoreAllMocks() never wipes them.
function matchMedia(query: string): MediaQueryList {
    return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() {
            return false;
        },
    } as MediaQueryList;
}

Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: matchMedia });
Object.defineProperty(window, 'scrollTo', { configurable: true, writable: true, value: function scrollTo() {} });

afterEach(() => {
    cleanup();
    localStorage.clear();
});
