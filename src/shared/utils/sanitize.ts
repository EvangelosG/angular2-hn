import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string | undefined): { __html: string } {
    return { __html: DOMPurify.sanitize(html ?? '') };
}

export function hasUrl(url: string | undefined): boolean {
    return !!url && url.indexOf('http') === 0;
}
