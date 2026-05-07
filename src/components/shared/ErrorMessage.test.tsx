import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the passed message text', () => {
        render(<ErrorMessage message="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders the offline-viewing helper paragraph', () => {
        render(<ErrorMessage message="oops" />);
        expect(screen.getByText(/offline viewing/i)).toBeInTheDocument();
    });

    it('uses the error-message root className', () => {
        const { container } = render(<ErrorMessage message="x" />);
        expect(container.querySelector('.error-message')).not.toBeNull();
    });
});
