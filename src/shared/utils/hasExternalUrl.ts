import type { Story } from '../models/story';

export function hasExternalUrl(item: Pick<Story, 'url'>): boolean {
    return item.url.indexOf('http') === 0;
}
