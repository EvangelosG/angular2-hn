import DOMPurify from 'dompurify';

// Angular sanitized every [innerHTML] binding; React's dangerouslySetInnerHTML does not.
export function sanitizeHtml(html: string | undefined | null): { __html: string } {
    return { __html: DOMPurify.sanitize(html ?? '') };
}
