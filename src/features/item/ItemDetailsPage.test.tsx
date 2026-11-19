import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackerNewsApi';
import type { Story } from '../../models';
import { ROUTER_FUTURE_FLAGS } from '../../routerFutureFlags';
import { SettingsProvider, STORAGE_KEYS } from '../../settings';
import { renderWithProviders } from '../../test/renderWithProviders';
import ItemDetailsPageDefault, { ItemDetailsPage } from '.';

vi.mock('../../api/hackerNewsApi');

const mockedFetchItemContent = vi.mocked(fetchItemContent);

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 123,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        content: '',
        comments: [
            {
                id: 10,
                level: 0,
                user: 'alice',
                time: 0,
                time_ago: '2 hours ago',
                content: 'First!',
                comments: [],
            },
            {
                id: 11,
                level: 0,
                user: null,
                time: 0,
                time_ago: '1 hour ago',
                content: '',
                deleted: true,
                comments: [],
            },
        ],
        comments_count: 2,
        ...overrides,
    };
}

function renderPage(route = '/item/1') {
    return renderWithProviders(<ItemDetailsPage />, { route, path: '/item/:id' });
}

function laptopHeader(container: HTMLElement): HTMLElement {
    return container.querySelector('.laptop') as HTMLElement;
}

beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

describe('ItemDetailsPage', () => {
    it('is the default export of the feature module', () => {
        expect(ItemDetailsPageDefault).toBe(ItemDetailsPage);
    });

    it('shows the loader while the item loads', () => {
        mockedFetchItemContent.mockReturnValue(new Promise(() => undefined));
        renderPage();

        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(mockedFetchItemContent).toHaveBeenCalledWith('1', { signal: expect.any(AbortSignal) });
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('renders the story header, metadata and comments', async () => {
        mockedFetchItemContent.mockResolvedValue(makeStory());
        const { container } = renderPage();

        await screen.findByText(/123 points by/);
        const header = laptopHeader(container);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(header).toHaveClass('item-header');
        expect(header).not.toHaveClass('head-margin');

        const title = within(header).getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(within(header).getByText('(example.com)')).toHaveClass('domain');
        expect(within(header).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(header).getByRole('link', { name: '2 comments' })).toHaveAttribute('href', '/item/1');
        expect(header.querySelector('.subtext')).toHaveTextContent('123 points by pg 3 hours ago | 2 comments');

        expect(container.querySelector('.mobile.item-header')).not.toBeNull();
        expect(screen.getByText('First!')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
    });

    it('opens title links in a new tab when the setting is on', async () => {
        localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, 'true');
        mockedFetchItemContent.mockResolvedValue(makeStory());
        renderPage();

        const titles = await screen.findAllByRole('link', { name: 'A story' });
        expect(titles).toHaveLength(2);
        for (const title of titles) {
            expect(title).toHaveAttribute('target', '_blank');
            expect(title).toHaveAttribute('rel', 'noopener');
        }
    });

    it('links Ask HN titles to the item page and renders the HTML content', async () => {
        mockedFetchItemContent.mockResolvedValue(
            makeStory({
                id: 7,
                type: 'ask',
                url: 'item?id=7',
                domain: undefined,
                title: 'Ask HN: Anything?',
                content: '<p>Some <i>question</i></p>',
                text: 'Some question',
                comments: [],
                comments_count: 0,
            })
        );
        const { container } = renderPage('/item/7');

        const titles = await screen.findAllByRole('link', { name: 'Ask HN: Anything?' });
        for (const title of titles) {
            expect(title).toHaveAttribute('href', '/item/7');
        }
        expect(container.querySelector('.domain')).toBeNull();
        expect(container.querySelector('i')).toHaveTextContent('question');
        const header = laptopHeader(container);
        expect(header).not.toHaveClass('item-header');
        expect(header).toHaveClass('head-margin');
        expect(within(header).getByRole('link', { name: 'discuss' })).toBeInTheDocument();
    });

    it('omits points and comment links for jobs', async () => {
        mockedFetchItemContent.mockResolvedValue(
            makeStory({ type: 'job', points: null, user: null, comments: [], comments_count: 0 })
        );
        const { container } = renderPage();

        await screen.findAllByRole('link', { name: 'A story' });
        const header = laptopHeader(container);
        expect(header).toHaveClass('item-header');
        expect(header.querySelector('.subtext')).toHaveTextContent(/^3 hours ago$/);
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('renders poll options with proportional bars', async () => {
        mockedFetchItemContent.mockResolvedValue(
            makeStory({
                type: 'poll',
                url: 'item?id=1',
                poll: [
                    { points: 30, content: 'Option <b>A</b>' },
                    { points: 10, content: 'Option B' },
                ],
                poll_votes_count: 40,
            })
        );
        const { container } = renderPage();

        await screen.findByText('30 points');
        const options = container.querySelectorAll('.pollContent');
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent('Option A');
        expect(screen.getByText('10 points')).toHaveClass('subtext');
        const bars = container.querySelectorAll<HTMLElement>('.pollBar');
        expect(bars[0].style.width).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
    });

    it('shows the Angular error message when loading fails', async () => {
        mockedFetchItemContent.mockRejectedValue(new Error('boom'));
        renderPage();

        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('ignores aborted requests and aborts on unmount', async () => {
        let signal: AbortSignal | undefined;
        mockedFetchItemContent.mockImplementation((_id, options) => {
            signal = options?.signal;
            return new Promise((_resolve, reject) => {
                signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
            });
        });
        const { unmount } = renderPage();

        expect(signal?.aborted).toBe(false);
        unmount();
        expect(signal?.aborted).toBe(true);
    });

    it('goes back when the back button is clicked', async () => {
        const user = userEvent.setup();
        mockedFetchItemContent.mockResolvedValue(makeStory());
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/news/1', '/item/1']} initialIndex={1} future={ROUTER_FUTURE_FLAGS}>
                    <Routes>
                        <Route path="/news/:page" element={<p>Feed page</p>} />
                        <Route path="/item/:id" element={<ItemDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );

        await user.click(await screen.findByRole('button', { name: 'Go back' }));
        expect(screen.getByText('Feed page')).toBeInTheDocument();
    });
});
