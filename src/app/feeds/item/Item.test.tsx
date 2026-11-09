import { screen } from '@testing-library/react';

import { makeStory } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/render';
import Item from './Item';

describe('Item', () => {
    it('links external stories to their URL and shows the domain', () => {
        renderWithProviders(<Item item={makeStory()} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', 'https://example.com/post');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByText('3 comments')[0]).toHaveAttribute('href', '/item/1');
    });

    it('links Ask HN style stories to the item page', () => {
        renderWithProviders(<Item item={makeStory({ id: 9, url: 'item?id=9', domain: undefined })} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/9');
    });

    it('applies the font size, spacing and new-tab settings', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '7');
        localStorage.setItem('openLinkInNewTab', 'true');
        const { container } = renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveStyle({ fontSize: '22px' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
        expect(container.querySelector('.app-item > div')).toHaveStyle({ marginBottom: '7px' });
    });
});
