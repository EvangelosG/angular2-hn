import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { jsonResponse, makeStory } from '../test/fixtures';
import { AppRoutes } from './App';
import { SettingsProvider } from './shared/settings/SettingsProvider';

function renderApp(route: string) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[route]}>
                <AppRoutes />
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('App routes', () => {
    const fetchMock = vi.fn(async () => jsonResponse([makeStory()]));

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });
    afterEach(() => {
        fetchMock.mockClear();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('redirects / to the first news page', async () => {
        renderApp('/');
        await screen.findByText('A story');
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1', expect.anything());
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('maps /%s/:page to the %s feed', async (feed) => {
        renderApp(`/${feed}/2`);
        await screen.findByText('A story');
        expect(fetchMock).toHaveBeenCalledWith(
            `https://node-hnapi.herokuapp.com/${feed}?page=2`,
            expect.anything()
        );
    });

    it('applies the theme class to the root element', async () => {
        localStorage.setItem('theme', 'amoledblack');
        const { container } = renderApp('/news/1');
        await screen.findByText('A story');
        expect(container.firstElementChild).toHaveClass('amoledblack');
    });
});
