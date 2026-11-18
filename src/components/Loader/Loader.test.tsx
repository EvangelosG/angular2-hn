import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Loader } from './Loader';

describe('Loader', () => {
    it('renders the loading indicator with the theme class names', () => {
        const { container } = render(<Loader />);
        expect(screen.getByText('Loading...')).toHaveClass('loader');
        expect(container.firstChild).toHaveClass('loading-section');
    });
});
