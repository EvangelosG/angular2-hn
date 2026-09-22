import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerServiceWorker } from './registerServiceWorker';

const importSpy = vi.fn();

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    importSpy.mockClear();
});

describe('registerServiceWorker', () => {
    it('does nothing in development', () => {
        vi.stubEnv('PROD', false);
        vi.stubGlobal('navigator', { serviceWorker: { register: importSpy } });

        expect(() => registerServiceWorker()).not.toThrow();
        expect(importSpy).not.toHaveBeenCalled();
    });

    it('does nothing when the browser has no service worker support', () => {
        vi.stubEnv('PROD', true);
        vi.stubGlobal('navigator', {});

        expect(() => registerServiceWorker()).not.toThrow();
        expect(importSpy).not.toHaveBeenCalled();
    });
});
