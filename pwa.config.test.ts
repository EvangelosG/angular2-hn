import { describe, expect, it } from 'vitest';

import { API_ORIGIN, manifest, pwaOptions } from './pwa.config.ts';

function globExtensions(patterns: string[]): string[] {
    return patterns.flatMap((pattern) => {
        const match = pattern.match(/\{([^}]+)\}$/);
        return match ? match[1].split(',') : [];
    });
}

describe('pwa options', () => {
    const workbox = pwaOptions.workbox!;
    const iconExtensions = (manifest.icons ?? []).map((icon) => icon.src.split('.').pop() ?? '');

    it('does not precache manifest icons twice', () => {
        // Icons matched by the glob patterns are precached with a revision; the plugin would add
        // them a second time without one, which makes workbox reject the whole precache list.
        expect(iconExtensions.every((extension) => globExtensions(workbox.globPatterns!).includes(extension))).toBe(
            true
        );
        expect(pwaOptions.includeManifestIcons).toBe(false);
    });

    it('serves the app shell for client-side routes', () => {
        expect(workbox.navigateFallback).toBe('index.html');
    });

    it('caches Hacker News API responses network-first', () => {
        const [rule] = workbox.runtimeCaching!;

        expect((rule.urlPattern as RegExp).test(`${API_ORIGIN}/news?page=1`)).toBe(true);
        expect(rule.handler).toBe('NetworkFirst');
    });
});
