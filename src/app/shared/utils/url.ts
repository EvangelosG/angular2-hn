export function hasExternalUrl(item: { url: string }): boolean {
    return item.url.indexOf('http') === 0;
}

export function externalLinkProps(openInNewTab: boolean): { target?: string; rel?: string } {
    return openInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}
