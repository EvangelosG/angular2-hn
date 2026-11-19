import { render, screen } from '@testing-library/react';

import { Loader } from './Loader';

describe('Loader', () => {
    it('renders the loading indicator with the theme class names', () => {
        render(<Loader />);

        const status = screen.getByRole('status');
        expect(status).toHaveClass('loading-section');
        expect(screen.getByText('Loading...')).toHaveClass('loader');
    });
});
