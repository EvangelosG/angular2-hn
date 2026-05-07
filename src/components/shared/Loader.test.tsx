import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loader from './Loader';

describe('Loader', () => {
    it('renders the loader element with Loading... text', () => {
        const { container } = render(<Loader />);
        expect(container.querySelector('.loader')).not.toBeNull();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
