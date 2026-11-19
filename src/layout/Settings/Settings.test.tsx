import { fireEvent, screen } from '@testing-library/react';
import { useEffect } from 'react';

import { useSettings } from '../../settings';
import { renderWithProviders } from '../../test/renderWithProviders';
import { Settings } from './Settings';

function SettingsHarness() {
    const { settings, toggleSettings } = useSettings();

    useEffect(() => {
        toggleSettings();
        // Open once on mount, like clicking the header cog.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <pre data-testid="settings">{JSON.stringify(settings)}</pre>
            {settings.showSettings && <Settings />}
        </>
    );
}

function currentSettings() {
    return JSON.parse(screen.getByTestId('settings').textContent ?? '{}');
}

describe('Settings', () => {
    it('renders the popup with the current settings', () => {
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<SettingsHarness />);

        expect(screen.getByRole('dialog')).toHaveClass('popup');
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Open links in a new tab' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).not.toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(20);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(5);
    });

    it('toggles opening links in a new tab', () => {
        renderWithProviders(<SettingsHarness />);
        const checkbox = screen.getByRole('checkbox', { name: 'Open links in a new tab' });
        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(currentSettings().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it.each([
        ['Night', 'night'],
        ['Black (AMOLED)', 'amoledblack'],
    ])('selects the %s theme', (label, theme) => {
        renderWithProviders(<SettingsHarness />);
        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();

        fireEvent.click(screen.getByRole('radio', { name: label }));

        expect(screen.getByRole('radio', { name: label })).toBeChecked();
        expect(currentSettings().theme).toBe(theme);
        expect(localStorage.getItem('theme')).toBe(theme);
    });

    it('changes the title font size and list spacing', () => {
        renderWithProviders(<SettingsHarness />);

        fireEvent.change(screen.getByLabelText('Font size:'), { target: { value: '22' } });
        fireEvent.change(screen.getByLabelText('List spacing:'), { target: { value: '8' } });

        expect(currentSettings()).toMatchObject({ titleFontSize: '22', listSpacing: '8' });
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('8');
        expect(screen.getByLabelText('Font size:')).toHaveValue(22);
    });

    it('closes when the close button is clicked', () => {
        renderWithProviders(<SettingsHarness />);

        fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(currentSettings().showSettings).toBe(false);
    });

    it('closes from the keyboard', () => {
        renderWithProviders(<SettingsHarness />);

        fireEvent.keyDown(screen.getByRole('button', { name: 'Close settings' }), { key: 'Enter' });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
