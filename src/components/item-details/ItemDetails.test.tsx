import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import * as api from '../../hooks/useHackerNewsApi';
import type { Comment as CommentModel, Story } from '../../models';
import ItemDetails from './ItemDetails';

function makeComment(id: number, overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: `<p>Comment ${id}</p>`,
        comments: [],
        ...overrides,
    };
}

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 100,
        title: 'Detail Story',
        points: 50,
        user: 'alice',
        time: 0,
        time_ago: '5 hours ago',
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        content: '<p>Body content</p>',
        comments: [makeComment(1)],
        comments_count: 1,
        ...overrides,
    };
}

function renderDetails(itemId: string | number = 100) {
    return render(
        <MemoryRouter initialEntries={[`/item/${itemId}`]}>
            <SettingsProvider>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('renders Loader, then item content and comments', async () => {
        const story = makeStory();
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(story);

        renderDetails(100);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByText('Detail Story').length).toBeGreaterThan(0);
        });
        expect(screen.getByText('Body content')).toBeInTheDocument();
        expect(screen.getByText('Comment 1')).toBeInTheDocument();
    });

    it('renders ErrorMessage on a fetch error', async () => {
        vi.spyOn(api, 'fetchItemContent').mockRejectedValue(new Error('boom'));

        renderDetails(100);

        await waitFor(() => {
            expect(screen.getByText(/could not load item comments/i)).toBeInTheDocument();
        });
    });

    it('renders poll bars when item.type is "poll"', async () => {
        const pollStory = makeStory({
            type: 'poll',
            content: '',
            url: undefined,
            domain: undefined,
            poll: [
                { points: 60, content: 'Option A' },
                { points: 40, content: 'Option B' },
            ],
            poll_votes_count: 100,
            comments: [],
            comments_count: 0,
        });
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(pollStory);

        const { container } = renderDetails(100);

        await waitFor(() => {
            expect(screen.getByText('Option A')).toBeInTheDocument();
        });
        expect(screen.getByText('Option B')).toBeInTheDocument();

        const bars = container.querySelectorAll('.pollBar');
        expect(bars.length).toBe(2);
        expect((bars[0] as HTMLElement).style.width).toBe('60%');
        expect((bars[1] as HTMLElement).style.width).toBe('40%');
    });
});
