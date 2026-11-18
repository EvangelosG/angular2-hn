import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSettings } from '../settings';
import { renderWithProviders } from '../test/renderWithProviders';
import { Settings } from './Settings';

function SettingsProbe() {
    const { settings } = useSettings();
    return <pre data-testid="settings">{JSON.stringify(settings)}</pre>;
}

function currentSettings() {
    return JSON.parse(screen.getByTestId('settings').textContent ?? '{}');
}

function renderSettings(initialSettings = {}) {
    return renderWithProviders(
        <>
            <Settings />
            <SettingsProbe />
        </>,
        { initialSettings: { showSettings: true, ...initialSettings } }
    );
}

describe('Settings', () => {
    it('renders the popup with its controls reflecting the current settings', () => {
        renderSettings({ theme: 'night', openLinkInNewTab: true, titleFontSize: '20', listSpacing: '4' });

        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
        expect(document.querySelector('#popup1.overlay .popup')).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Open links in a new tab' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).not.toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(20);
        expect(screen.getByLabelText('Font size:')).toHaveAttribute('min', '1');
        expect(screen.getByLabelText('List spacing:')).toHaveValue(4);
        expect(screen.getByLabelText('List spacing:')).toHaveAttribute('min', '0');
    });

    it('closes via the × button', async () => {
        const { user } = renderSettings();

        await user.click(screen.getByText('×'));

        expect(currentSettings().showSettings).toBe(false);
    });

    it('toggles opening links in a new tab and persists it', async () => {
        const { user } = renderSettings({ openLinkInNewTab: false });
        const checkbox = screen.getByRole('checkbox', { name: 'Open links in a new tab' });

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(currentSettings().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it.each([
        ['Night', 'night'],
        ['Black (AMOLED)', 'amoledblack'],
        ['Default', 'default'],
    ])('selects the %s theme and persists it', async (label, theme) => {
        const { user } = renderSettings({ theme: label === 'Default' ? 'night' : 'default' });

        await user.click(screen.getByRole('radio', { name: label }));

        expect(screen.getByRole('radio', { name: label })).toBeChecked();
        expect(currentSettings().theme).toBe(theme);
        expect(localStorage.getItem('theme')).toBe(theme);
    });

    it('changes the title font size and persists it', async () => {
        const { user } = renderSettings({ titleFontSize: '16' });
        const input = screen.getByLabelText('Font size:');

        await user.clear(input);
        await user.type(input, '22');

        expect(input).toHaveValue(22);
        expect(currentSettings().titleFontSize).toBe('22');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
    });

    it('changes the list spacing and persists it', () => {
        renderSettings({ listSpacing: '0' });
        const input = screen.getByLabelText('List spacing:');

        fireEvent.change(input, { target: { value: '7' } });

        expect(input).toHaveValue(7);
        expect(currentSettings().listSpacing).toBe('7');
        expect(localStorage.getItem('listSpacing')).toBe('7');
    });
});
