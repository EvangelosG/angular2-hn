import { describe, expect, it } from 'vitest';

import { hasUrl, sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
    it('keeps formatting markup and strips scripts and handlers', () => {
        const { __html } = sanitizeHtml('<p><i>hi</i><img src="x" onerror="alert(1)"><script>alert(1)</script></p>');
        expect(__html).toBe('<p><i>hi</i><img src="x"></p>');
    });

    it('handles missing html', () => {
        expect(sanitizeHtml(undefined).__html).toBe('');
    });
});

describe('hasUrl', () => {
    it('is true only for absolute http(s) urls', () => {
        expect(hasUrl('https://example.com')).toBe(true);
        expect(hasUrl('item?id=1')).toBe(false);
        expect(hasUrl(undefined)).toBe(false);
    });
});
