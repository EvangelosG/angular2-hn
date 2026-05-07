import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

function pendingFetch() {
    return new Promise(() => undefined);
}

describe('Theme switching', () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.replaceState({}, '', '/');
        vi.stubGlobal('fetch', vi.fn(pendingFetch));
    });

    afterEach(() => {
        localStorage.clear();
        window.history.replaceState({}, '', '/');
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('updates the root div className when each theme radio is selected', async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        // Default theme — root has class 'default' (or empty depending on system).
        expect(container.firstChild).toBeInstanceOf(HTMLElement);

        // Open the settings popup.
        await user.click(screen.getByAltText('Settings'));

        // Select Night.
        await user.click(screen.getByRole('radio', { name: /^night$/i }));
        await waitFor(() => {
            expect(container.firstChild).toHaveClass('night');
        });

        // Switch to AMOLED Black.
        await user.click(screen.getByRole('radio', { name: /black \(amoled\)/i }));
        await waitFor(() => {
            expect(container.firstChild).toHaveClass('amoledblack');
        });

        // Back to Default.
        await user.click(screen.getByRole('radio', { name: /^default$/i }));
        await waitFor(() => {
            expect(container.firstChild).toHaveClass('default');
        });
    });

    it('persists the chosen theme across remounts', async () => {
        const user = userEvent.setup();
        const first = render(<App />);

        await user.click(screen.getByAltText('Settings'));
        await user.click(screen.getByRole('radio', { name: /^night$/i }));

        await waitFor(() => {
            expect(first.container.firstChild).toHaveClass('night');
        });

        first.unmount();

        const second = render(<App />);
        await waitFor(() => {
            expect(second.container.firstChild).toHaveClass('night');
        });
    });
});
