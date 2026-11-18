import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Settings } from '../../models/settings';
import type { Story } from '../../models/story';
import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { FeedItem } from './FeedItem';

function renderItem(item: Story, initialSettings?: Partial<Settings>) {
    return renderWithProviders(<FeedItem item={item} />, { initialSettings });
}

describe('FeedItem', () => {
    it('renders an external link with its domain for stories with an http url', () => {
        renderItem(makeStory({ title: 'External', url: 'https://example.com/a', domain: 'example.com' }));

        const title = screen.getByRole('link', { name: 'External' });
        expect(title).toHaveAttribute('href', 'https://example.com/a');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
    });

    it('renders an internal /item/:id link for ask posts', () => {
        renderItem(makeStory({ id: 42, title: 'Ask HN: thing?', url: 'item?id=42', domain: undefined, type: 'ask' }));

        expect(screen.getByRole('link', { name: 'Ask HN: thing?' })).toHaveAttribute('href', '/item/42');
        expect(screen.queryByText(/^\(/)).not.toBeInTheDocument();
    });

    it('navigates to the item page when an internal title is clicked', async () => {
        const { user } = renderItem(makeStory({ id: 7, title: 'Internal', url: 'item?id=7' }));

        await user.click(screen.getByRole('link', { name: 'Internal' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/item/7');
    });

    it('renders mobile and laptop subtext for stories', () => {
        renderItem(makeStory({ id: 5, user: 'pg', points: 120, time_ago: '3 hours ago', comments_count: 12 }));

        const palm = screen.getByTestId('subtext-palm');
        expect(palm).toHaveClass('subtext-palm');
        expect(within(palm).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(palm).getByText('120 ★')).toBeInTheDocument();
        expect(palm).toHaveTextContent('3 hours ago');
        expect(within(palm).getByRole('link', { name: '• 12 comments' })).toHaveAttribute('href', '/item/5');

        const laptop = screen.getByTestId('subtext-laptop');
        expect(laptop).toHaveClass('subtext-laptop');
        expect(laptop).toHaveTextContent('120 points by pg 3 hours ago | 12 comments');
        expect(within(laptop).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(laptop).getByRole('link', { name: '12 comments' })).toHaveAttribute('href', '/item/5');
        expect(within(laptop).getByText(/3 hours ago/)).toHaveClass('itemDetails');
    });

    it('uses the comment pipe wording', () => {
        renderItem(makeStory({ comments_count: 0 }));
        expect(within(screen.getByTestId('subtext-laptop')).getByRole('link', { name: 'discuss' })).toBeInTheDocument();
    });

    it('renders job rows without user, points or comments', () => {
        renderItem(
            makeStory({ type: 'job', user: null, points: null, time_ago: '5 hours ago', comments_count: 0 })
        );

        const palm = screen.getByTestId('subtext-palm');
        const laptop = screen.getByTestId('subtext-laptop');
        expect(palm).toHaveTextContent(/^5 hours ago$/);
        expect(laptop).toHaveTextContent(/^5 hours ago$/);
        expect(within(laptop).getByText('5 hours ago')).not.toHaveClass('itemDetails');
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText(/★/)).not.toBeInTheDocument();
        expect(screen.queryByText('discuss')).not.toBeInTheDocument();
    });

    it('applies title font size and list spacing from settings', () => {
        const { container } = renderItem(makeStory({ title: 'Sized' }), { titleFontSize: '20', listSpacing: '15' });

        expect(screen.getByRole('link', { name: 'Sized' })).toHaveStyle({ fontSize: '20px' });
        expect(container.querySelector('.itemBlock > div')).toHaveStyle({ marginBottom: '15px' });
    });

    it('opens external links in a new tab when the setting is on', () => {
        renderItem(makeStory({ title: 'External' }), { openLinkInNewTab: true });

        const title = screen.getByRole('link', { name: 'External' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });
});
