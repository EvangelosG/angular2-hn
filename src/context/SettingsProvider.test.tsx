import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSettings } from '../hooks/useSettings';
import { SettingsProvider } from './SettingsProvider';

function stubMatchMedia(matches: boolean) {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const media = {
        media: '(prefers-color-scheme: dark)',
        matches,
        addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    } as unknown as MediaQueryList;

    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => media)
    );

    return {
        emit(nextMatches: boolean) {
            act(() => listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent)));
        },
        get listenerCount() {
            return listeners.size;
        },
    };
}

function Probe() {
    const { settings, setTheme, toggleOpenLinksInNewTab } = useSettings();
    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="new-tab">{String(settings.openLinkInNewTab)}</span>
            <button onClick={() => setTheme('amoledblack')}>set theme</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle new tab</button>
        </div>
    );
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('SettingsProvider', () => {
    it('defaults to the night theme when the system prefers dark and nothing is saved', () => {
        stubMatchMedia(true);

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('night');
    });

    it('keeps the saved theme instead of following the system preference', () => {
        stubMatchMedia(true);
        localStorage.setItem('theme', 'amoledblack');

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
    });

    it('follows later system colour scheme changes', () => {
        const media = stubMatchMedia(false);

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('default');

        media.emit(true);

        expect(screen.getByTestId('theme')).toHaveTextContent('night');
    });

    it('persists settings changes to localStorage', async () => {
        stubMatchMedia(false);
        const user = userEvent.setup();

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        await user.click(screen.getByText('set theme'));
        await user.click(screen.getByText('toggle new tab'));

        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(screen.getByTestId('new-tab')).toHaveTextContent('true');
    });

    it('removes the media query listener on unmount', () => {
        const media = stubMatchMedia(false);

        const { unmount } = render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );
        expect(media.listenerCount).toBe(1);

        unmount();
        expect(media.listenerCount).toBe(0);
    });
});
