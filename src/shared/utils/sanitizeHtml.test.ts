import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
    it('keeps formatting and links but strips scripts and handlers', () => {
        const { __html } = sanitizeHtml('<p>hi <a href="https://x.y">link</a><img src=x onerror="alert(1)"><script>alert(1)</script></p>');
        expect(__html).toContain('<a href="https://x.y">link</a>');
        expect(__html).not.toContain('onerror');
        expect(__html).not.toContain('<script');
    });

    it('handles missing html', () => {
        expect(sanitizeHtml(undefined).__html).toBe('');
    });
});
