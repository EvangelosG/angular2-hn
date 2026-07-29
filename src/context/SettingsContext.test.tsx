import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

type MediaListener = (event: MediaQueryListEvent) => void;

let listeners: MediaListener[] = [];

function stubMatchMedia(matches: boolean) {
    listeners = [];
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addEventListener: (_: string, listener: MediaListener) => listeners.push(listener),
        removeEventListener: (_: string, listener: MediaListener) => {
            listeners = listeners.filter(registered => registered !== listener);
        },
        dispatchEvent: vi.fn(),
    }));
}

function Probe() {
    const { settings, setFont, setSpacing, toggleOpenLinksInNewTab, toggleSettings } = useSettings();
    return (
        <div>
            <span data-testid="state">{JSON.stringify(settings)}</span>
            <button onClick={toggleSettings}>toggle settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle new tab</button>
            <button onClick={() => setFont('20')}>font</button>
            <button onClick={() => setSpacing('5')}>spacing</button>
        </div>
    );
}

function currentSettings() {
    return JSON.parse(screen.getByTestId('state').textContent as string);
}

describe('SettingsProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        stubMatchMedia(false);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('falls back to defaults when nothing is stored', () => {
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(currentSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads persisted settings from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '8');

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(currentSettings()).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '22',
            listSpacing: '8',
        });
    });

    it('uses the night theme when the system prefers dark and no theme is saved', () => {
        stubMatchMedia(true);

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(currentSettings().theme).toBe('night');
    });

    it('follows system colour scheme changes', () => {
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        act(() => listeners.forEach(listener => listener({ matches: true } as MediaQueryListEvent)));

        expect(currentSettings().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('persists updates to localStorage', async () => {
        const user = userEvent.setup();
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        await user.click(screen.getByText('toggle new tab'));
        await user.click(screen.getByText('font'));
        await user.click(screen.getByText('spacing'));
        await user.click(screen.getByText('toggle settings'));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
        expect(currentSettings().showSettings).toBe(true);
    });
});
