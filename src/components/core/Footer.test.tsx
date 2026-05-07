import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Footer from './Footer';

describe('Footer', () => {
    it('renders the GitHub link', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /github/i });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
    });
});
