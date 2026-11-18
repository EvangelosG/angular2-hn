import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

describe('Footer', () => {
    it('renders the GitHub love line in #footer', () => {
        const { container } = render(<Footer />);

        const footer = container.querySelector('#footer');
        expect(footer).toHaveTextContent('Show this project some ❤ on GitHub');
        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });
});
