import { screen } from '@testing-library/react';

import FeedItem from './FeedItem';
import { makeStory } from '../test/fixtures';
import { renderWithProviders } from '../test/render';

describe('FeedItem', () => {
    it('links external stories to their url with domain, author and comments', () => {
        renderWithProviders(<FeedItem item={makeStory()} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', 'https://example.com/post');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
        expect(screen.getByRole('link', { name: '3 comments' })).toHaveAttribute('href', '/item/1');
    });

    it('links self posts to the item page', () => {
        renderWithProviders(<FeedItem item={makeStory({ url: 'item?id=1', domain: '' })} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
    });

    it('hides author, points and comments for jobs', () => {
        renderWithProviders(<FeedItem item={makeStory({ type: 'job' })} />);
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('applies font size, spacing and new-tab settings', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '7');
        localStorage.setItem('openLinkInNewTab', 'true');
        const { container } = renderWithProviders(<FeedItem item={makeStory()} />);
        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveStyle({ fontSize: '22px' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
        expect(container.querySelector('.feed-item > div')).toHaveStyle({ marginBottom: '7px' });
    });
});
