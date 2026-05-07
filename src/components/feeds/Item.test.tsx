import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import type { Story } from '../../models';
import Item from './Item';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'My Story',
        points: 12,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: 'https://example.com/article',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        ...overrides,
    };
}

function renderItem(story: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={story} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Item', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renders an external <a> with the item url and target=_blank when openLinkInNewTab is enabled', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const story = makeStory();
        renderItem(story);

        const titleAnchors = screen
            .getAllByRole('link', { name: 'My Story' })
            .filter((node) => node.tagName === 'A' && node.getAttribute('href') === story.url);

        expect(titleAnchors.length).toBeGreaterThan(0);
        const titleLink = titleAnchors[0];
        expect(titleLink).toHaveAttribute('target', '_blank');
        expect(titleLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });

    it('renders an internal Link to /item/<id> when the item has no http url', () => {
        const story = makeStory({ url: undefined, domain: undefined });
        renderItem(story);

        const titleLink = screen.getAllByRole('link', { name: 'My Story' })[0];
        expect(titleLink).toHaveAttribute('href', '/item/42');
    });

    it('uses formatCommentCount for the comment-count text', async () => {
        const user = userEvent.setup();
        renderItem(makeStory({ comments_count: 1 }));
        // formatCommentCount(1) === "1 comment"; appears at least in subtext-laptop
        const oneComment = screen.getAllByText('1 comment');
        expect(oneComment.length).toBeGreaterThan(0);

        // Suppress unused user-event warning by performing a no-op interaction guard.
        void user;
    });

    it('shows "discuss" when comments_count is 0', () => {
        renderItem(makeStory({ comments_count: 0 }));
        expect(screen.getAllByText('discuss').length).toBeGreaterThan(0);
    });

    it('shows the domain span when the item has a domain', () => {
        renderItem(makeStory({ domain: 'example.com' }));
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });
});
