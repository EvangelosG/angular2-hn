import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Layout } from '../App';
import { SettingsProvider } from '../context/SettingsContext';
import * as api from '../hooks/useHackerNewsApi';
import type { Story, User } from '../models';

function makeStory(id: number, overrides: Partial<Story> = {}): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 42,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: undefined,
        comments: [],
        comments_count: 3,
        ...overrides,
    };
}

function makeUser(id: string, overrides: Partial<User> = {}): User {
    return {
        id,
        crated_time: 0,
        created: 'January 1, 2020',
        karma: 1000,
        avg: 5,
        about: 'about alice',
        ...overrides,
    };
}

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Layout />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('App navigation (integration)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('navigates feed -> item details -> user profile, then back', async () => {
        const stories = [makeStory(101), makeStory(102)];
        const itemDetails = makeStory(101, {
            content: '<p>Body of story 101</p>',
            comments: [],
            comments_count: 0,
        });
        const user = makeUser('alice');

        const fetchFeedSpy = vi.spyOn(api, 'fetchFeed').mockResolvedValue(stories);
        const fetchItemSpy = vi.spyOn(api, 'fetchItemContent').mockResolvedValue(itemDetails);
        const fetchUserSpy = vi.spyOn(api, 'fetchUser').mockResolvedValue(user);

        const u = userEvent.setup();
        renderAt('/news/1');

        // Feed renders Story 101 + Story 102.
        await waitFor(() => {
            expect(screen.getByText('Story 101')).toBeInTheDocument();
        });
        expect(screen.getByText('Story 102')).toBeInTheDocument();
        expect(fetchFeedSpy).toHaveBeenCalledWith('news', 1);

        // Click into Story 101 (Link -> /item/101 because url is undefined).
        await u.click(screen.getByText('Story 101'));

        // ItemDetails (lazy) loads, fetches item, and shows the content.
        await waitFor(() => {
            expect(screen.getByText(/Body of story 101/)).toBeInTheDocument();
        });
        expect(fetchItemSpy).toHaveBeenCalledWith('101');

        // Click on the user link (alice). Multiple "alice" links may render
        // (mobile + laptop subtext). Pick one and click it.
        const aliceLinks = await screen.findAllByRole('link', { name: 'alice' });
        await u.click(aliceLinks[0]);

        // User profile loads.
        await waitFor(() => {
            expect(screen.getByText('about alice')).toBeInTheDocument();
        });
        expect(screen.getByText(/Created January 1, 2020/)).toBeInTheDocument();
        expect(fetchUserSpy).toHaveBeenCalledWith('alice');

        // The User profile renders a back button (aria-label="Go back");
        // clicking it returns us to /item/101.
        const backButtons = screen.getAllByRole('button', { name: /go back/i });
        await u.click(backButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/Body of story 101/)).toBeInTheDocument();
        });
    });

    it('feed pagination link navigates to the next page', async () => {
        const page1 = Array.from({ length: 30 }, (_, i) => makeStory(i + 1));
        const page2 = [makeStory(31)];
        const fetchFeedSpy = vi.spyOn(api, 'fetchFeed').mockImplementation(async (_feed, page) => {
            return page === 1 ? page1 : page2;
        });

        const u = userEvent.setup();
        renderAt('/news/1');

        await waitFor(() => {
            expect(screen.getByText('Story 1')).toBeInTheDocument();
        });

        // Click "More" link to go to /news/2
        const moreLink = screen.getByRole('link', { name: /more/i });
        await u.click(moreLink);

        await waitFor(() => {
            expect(screen.getByText('Story 31')).toBeInTheDocument();
        });
        expect(fetchFeedSpy).toHaveBeenCalledWith('news', 2);

        // Sanity: the heading-level navigation links from the header are still present.
        expect(within(document.body).getByRole('link', { name: /^new$/i })).toBeInTheDocument();
    });
});
