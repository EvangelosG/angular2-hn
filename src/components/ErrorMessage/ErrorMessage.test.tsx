import { render, screen } from '@testing-library/react';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the message, offline hint and themed skull', () => {
        const { container } = render(<ErrorMessage message="Could not load item" />);

        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass('error-section');
        expect(screen.getByText('Could not load item')).toHaveClass('strong');
        expect(screen.getByText(/visit this page with a network connection/)).toBeInTheDocument();
        for (const part of ['skull', 'head', 'crack', 'mouth', 'teeth']) {
            expect(container.querySelector(`.${part}`)).not.toBeNull();
        }
    });
});
