import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider, useSettings } from '../../context/SettingsContext';
import Settings from './Settings';

function OpenSettings() {
    const { settings, toggleSettings } = useSettings();
    return (
        <>
            <button onClick={toggleSettings}>open</button>
            {settings.showSettings && <Settings />}
        </>
    );
}

function renderWithProvider() {
    return render(
        <SettingsProvider>
            <OpenSettings />
        </SettingsProvider>
    );
}

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('selecting a theme radio persists theme to localStorage', async () => {
        const user = userEvent.setup();
        renderWithProvider();
        await user.click(screen.getByRole('button', { name: 'open' }));

        const nightRadio = screen.getByRole('radio', { name: /^night$/i });
        await user.click(nightRadio);
        expect(localStorage.getItem('theme')).toBe('night');

        const amoledRadio = screen.getByRole('radio', { name: /amoled/i });
        await user.click(amoledRadio);
        expect(localStorage.getItem('theme')).toBe('amoledblack');

        const defaultRadio = screen.getByRole('radio', { name: /^default$/i });
        await user.click(defaultRadio);
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('toggling open-in-new-tab flips state and persists', async () => {
        const user = userEvent.setup();
        renderWithProvider();
        await user.click(screen.getByRole('button', { name: 'open' }));

        const checkbox = screen.getByRole('checkbox', { name: /open links in a new tab/i });
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('changing font size persists to localStorage', async () => {
        const user = userEvent.setup();
        renderWithProvider();
        await user.click(screen.getByRole('button', { name: 'open' }));

        const fontInput = screen.getByRole('spinbutton', { name: /font size/i });
        await user.clear(fontInput);
        await user.type(fontInput, '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('changing list spacing persists to localStorage', async () => {
        const user = userEvent.setup();
        renderWithProvider();
        await user.click(screen.getByRole('button', { name: 'open' }));

        const spacingInput = screen.getByRole('spinbutton', { name: /list spacing/i });
        await user.clear(spacingInput);
        await user.type(spacingInput, '10');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });

    it('clicking the close button hides Settings', async () => {
        const user = userEvent.setup();
        renderWithProvider();
        await user.click(screen.getByRole('button', { name: 'open' }));

        expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();

        // The close button is rendered as a span with text "×"
        await user.click(screen.getByText('×'));

        expect(screen.queryByRole('heading', { name: /^settings$/i })).not.toBeInTheDocument();
    });
});
