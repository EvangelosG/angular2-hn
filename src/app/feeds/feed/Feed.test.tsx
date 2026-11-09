import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { jsonResponse, makeStory } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/render';
import Feed from './Feed';

function renderFeed(route: string, feedType: 'news' | 'jobs' = 'news') {
    return renderWithProviders(
        <Routes>
            <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
        </Routes>,
        { route }
    );
}

const page = (count: number, type: 'link' | 'job' = 'link') =>
    Array.from({ length: count }, (_, i) => makeStory({ id: i + 1, title: `Story ${i + 1}`, type }));

describe('Feed', () => {
    beforeEach(() => {
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('renders stories with a More link on a full first page', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(page(30))));
        renderFeed('/news/1');

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(screen.getByRole('list')).toHaveAttribute('start', '1');
        expect(screen.getByText(/More/)).toHaveAttribute('href', '/news/2');
        expect(screen.queryByText(/Prev/)).not.toBeInTheDocument();
    });

    it('numbers later pages and links back', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(page(12))));
        renderFeed('/news/3');

        await screen.findByText('Story 1');
        expect(screen.getByRole('list')).toHaveAttribute('start', '61');
        expect(screen.getByText(/Prev/)).toHaveAttribute('href', '/news/2');
        expect(screen.queryByText(/More/)).not.toBeInTheDocument();
    });

    it('shows the jobs header and hides points for jobs', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(page(2, 'job'))));
        renderFeed('/jobs/1', 'jobs');

        expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('shows an error when the feed fails to load', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        renderFeed('/news/1');

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });
});
