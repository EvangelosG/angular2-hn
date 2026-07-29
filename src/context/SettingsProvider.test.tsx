import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

function SettingsProbe() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    return (
        <div>
            <span data-testid="state">{JSON.stringify(settings)}</span>
            <button onClick={toggleSettings}>toggle settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle new tab</button>
            <button onClick={() => setTheme('amoledblack')}>set theme</button>
            <button onClick={() => setFont('20')}>set font</button>
            <button onClick={() => setSpacing('5')}>set spacing</button>
        </div>
    );
}

function renderProbe() {
    render(
        <SettingsProvider>
            <SettingsProbe />
        </SettingsProvider>
    );
    return () => JSON.parse(screen.getByTestId('state').textContent as string);
}

function click(name: string) {
    fireEvent.click(screen.getByText(name));
}

describe('SettingsProvider', () => {
    it('falls back to defaults when nothing is stored', () => {
        const state = renderProbe();

        expect(state()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('restores persisted settings', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '3');

        const state = renderProbe();

        expect(state()).toMatchObject({
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '22',
            listSpacing: '3',
        });
    });

    it('uses the system preferred color scheme when no theme is stored', () => {
        vi.stubGlobal(
            'matchMedia',
            vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
        );

        const state = renderProbe();

        expect(state().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('persists mutations to localStorage', () => {
        const state = renderProbe();

        click('toggle settings');
        expect(state().showSettings).toBe(true);

        click('toggle new tab');
        expect(state().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        click('set theme');
        expect(localStorage.getItem('theme')).toBe('amoledblack');

        click('set font');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        click('set spacing');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('removes the color scheme listener on unmount', () => {
        const removeEventListener = vi.fn();
        vi.stubGlobal(
            'matchMedia',
            vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener })
        );

        const { unmount } = render(
            <SettingsProvider>
                <SettingsProbe />
            </SettingsProvider>
        );
        unmount();

        expect(removeEventListener).toHaveBeenCalled();
    });
});
