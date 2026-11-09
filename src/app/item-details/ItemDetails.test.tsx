import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { jsonResponse, makeComment, makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import ItemDetails from './ItemDetails';

function renderItem(id: number) {
    return renderWithProviders(
        <Routes>
            <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>,
        { route: `/item/${id}` }
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('renders the story and its comments', async () => {
        const story = makeStory({
            comments: [makeComment({ comments: [makeComment({ id: 2, content: 'Child' })] })],
        });
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(story)));
        renderItem(1);

        expect(await screen.findAllByText('A story')).not.toHaveLength(0);
        expect(screen.getByText('Top comment')).toBeInTheDocument();
        expect(screen.getByText('Child')).toBeInTheDocument();
    });

    it('renders poll results with proportional bars', async () => {
        const poll = makeStory({ id: 10, type: 'poll', poll: [{ content: '', points: 0 }, { content: '', points: 0 }] });
        vi.stubGlobal(
            'fetch',
            vi.fn(async (url: string) => {
                if (url.endsWith('/item/10')) return jsonResponse(poll);
                if (url.endsWith('/item/11')) return jsonResponse({ content: 'Option A', points: 75 });
                return jsonResponse({ content: 'Option B', points: 25 });
            })
        );
        const { container } = renderItem(10);

        expect(await screen.findByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('75 points')).toBeInTheDocument();
        const bars = container.querySelectorAll<HTMLElement>('.pollBar');
        expect([...bars].map((bar) => bar.style.width)).toEqual(['75%', '25%']);
    });

    it('shows an error when the item fails to load', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        renderItem(1);
        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });
});
