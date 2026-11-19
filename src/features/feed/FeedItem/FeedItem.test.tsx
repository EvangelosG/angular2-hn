import { screen } from '@testing-library/react';

import type { Story } from '../../../models';
import { STORAGE_KEYS } from '../../../settings';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { FeedItem } from './FeedItem';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'A great story',
        points: 123,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 7,
        ...overrides,
    };
}

describe('FeedItem', () => {
    it('renders an external story with domain, points, user and comments', () => {
        const { container } = renderWithProviders(<FeedItem item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A great story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(screen.getByText('(example.com)')).toHaveClass('domain');

        const laptop = container.querySelector('.subtext-laptop');
        expect(laptop).toHaveTextContent('123 points by pg 3 hours ago | 7 comments');
        const palm = container.querySelector('.subtext-palm');
        expect(palm).toHaveTextContent('pg123 ★');
        expect(palm).toHaveTextContent('3 hours ago • 7 comments');

        for (const link of screen.getAllByRole('link', { name: 'pg' })) {
            expect(link).toHaveAttribute('href', '/user/pg');
        }
        for (const link of screen.getAllByRole('link', { name: /7 comments/ })) {
            expect(link).toHaveAttribute('href', '/item/42');
        }
    });

    it('links internal items to the item page without a domain', () => {
        renderWithProviders(
            <FeedItem item={makeStory({ url: 'item?id=42', domain: undefined, type: 'ask', comments_count: 0 })} />
        );

        expect(screen.getByRole('link', { name: 'A great story' })).toHaveAttribute('href', '/item/42');
        expect(screen.queryByText(/example\.com/)).not.toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /discuss/ })).toHaveLength(2);
    });

    it('renders job items without points, user or comments', () => {
        const { container } = renderWithProviders(
            <FeedItem item={makeStory({ type: 'job', points: null, user: null })} />
        );

        expect(container.querySelector('.subtext-laptop')).toHaveTextContent(/^3 hours ago$/);
        expect(container.querySelector('.subtext-palm')).toHaveTextContent(/^3 hours ago$/);
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText(/★/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /comment|discuss/ })).not.toBeInTheDocument();
    });

    it('applies open-in-new-tab, title font size and list spacing settings', () => {
        localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, 'true');
        localStorage.setItem(STORAGE_KEYS.titleFontSize, '20');
        localStorage.setItem(STORAGE_KEYS.listSpacing, '12');

        const { container } = renderWithProviders(<FeedItem item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A great story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
        expect(title).toHaveStyle({ fontSize: '20px' });
        expect(container.firstElementChild).toHaveStyle({ marginBottom: '12px' });
    });
});
