import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the message, the offline hint and the skull', () => {
        const { container } = render(<ErrorMessage message="Could not load user pg." />);
        expect(screen.getByText('Could not load user pg.')).toBeInTheDocument();
        expect(screen.getByText(/visit this page with a network connection first/)).toBeInTheDocument();
        expect(container.firstChild).toHaveClass('error-section');
        for (const part of ['skull', 'head', 'crack', 'mouth', 'teeth']) {
            expect(container.querySelector(`.${part}`)).not.toBeNull();
        }
    });
});
