import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

type ChangeListener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(matches: boolean) {
    const listeners: ChangeListener[] = [];

    vi.stubGlobal(
        'matchMedia',
        vi.fn(
            (query: string) =>
                ({
                    media: query,
                    matches,
                    addEventListener: (_: string, listener: ChangeListener) => listeners.push(listener),
                    removeEventListener: (_: string, listener: ChangeListener) => {
                        const index = listeners.indexOf(listener);
                        if (index >= 0) {
                            listeners.splice(index, 1);
                        }
                    },
                }) as unknown as MediaQueryList
        )
    );

    return {
        emit: (nextMatches: boolean) =>
            act(() => listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent))),
    };
}

function Probe() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setFont, setSpacing } = useSettings();

    return (
        <div>
            <span data-testid="state">{JSON.stringify(settings)}</span>
            <button onClick={toggleSettings}>toggle-settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle-links</button>
            <button onClick={() => setFont('20')}>set-font</button>
            <button onClick={() => setSpacing('5')}>set-spacing</button>
        </div>
    );
}

function renderProbe() {
    render(
        <SettingsProvider>
            <Probe />
        </SettingsProvider>
    );
    return () => JSON.parse(screen.getByTestId('state').textContent as string);
}

afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
});

describe('SettingsProvider', () => {
    it('falls back to the system colour scheme when no theme is stored', () => {
        stubMatchMedia(true);

        const state = renderProbe();

        expect(state().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('prefers the stored theme over the system colour scheme', () => {
        localStorage.setItem('theme', 'amoledblack');
        stubMatchMedia(true);

        const state = renderProbe();

        expect(state().theme).toBe('amoledblack');
    });

    it('follows later system colour scheme changes', () => {
        const media = stubMatchMedia(false);

        const state = renderProbe();
        expect(state().theme).toBe('default');

        media.emit(true);
        expect(state().theme).toBe('night');
    });

    it('reads persisted preferences on start up', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '4');
        stubMatchMedia(false);

        const state = renderProbe();

        expect(state()).toMatchObject({
            showSettings: false,
            openLinkInNewTab: true,
            titleFontSize: '22',
            listSpacing: '4',
        });
    });

    it('persists preference changes to localStorage', () => {
        stubMatchMedia(false);

        const state = renderProbe();

        act(() => screen.getByText('toggle-links').click());
        act(() => screen.getByText('set-font').click());
        act(() => screen.getByText('set-spacing').click());
        act(() => screen.getByText('toggle-settings').click());

        expect(state()).toMatchObject({
            showSettings: true,
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '5',
        });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });
});
