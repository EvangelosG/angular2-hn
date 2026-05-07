import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

interface MediaQueryListMock {
    media: string;
    matches: boolean;
    onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
    dispatchEvent: ReturnType<typeof vi.fn>;
}

function createMatchMediaMock(matches: boolean): {
    matchMedia: ReturnType<typeof vi.fn>;
    listeners: Array<(event: MediaQueryListEvent) => void>;
    media: MediaQueryListMock;
} {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    const media: MediaQueryListMock = {
        media: '(prefers-color-scheme: dark)',
        matches,
        onchange: null,
        addEventListener: vi.fn((_event: string, listener: (event: MediaQueryListEvent) => void) => {
            listeners.push(listener);
        }),
        removeEventListener: vi.fn((_event: string, listener: (event: MediaQueryListEvent) => void) => {
            const idx = listeners.indexOf(listener);
            if (idx !== -1) listeners.splice(idx, 1);
        }),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    };
    const matchMedia = vi.fn(() => media as unknown as MediaQueryList);
    return { matchMedia, listeners, media };
}

function Consumer() {
    const {
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
    } = useSettings();
    return (
        <div>
            <div data-testid="theme">{settings.theme}</div>
            <div data-testid="open-link-in-new-tab">{String(settings.openLinkInNewTab)}</div>
            <div data-testid="title-font-size">{settings.titleFontSize}</div>
            <div data-testid="list-spacing">{settings.listSpacing}</div>
            <div data-testid="show-settings">{String(settings.showSettings)}</div>
            <button onClick={toggleSettings}>toggle-settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle-open</button>
            <button onClick={() => setTheme('night')}>set-theme-night</button>
            <button onClick={() => setFont(20)}>set-font-20</button>
            <button onClick={() => setSpacing(10)}>set-spacing-10</button>
        </div>
    );
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('SettingsProvider initial values', () => {
    it('reads saved values from localStorage', () => {
        localStorage.setItem('theme', 'amoled');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '18');
        localStorage.setItem('listSpacing', '8');

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('theme').textContent).toBe('amoled');
        expect(screen.getByTestId('open-link-in-new-tab').textContent).toBe('true');
        expect(screen.getByTestId('title-font-size').textContent).toBe('18');
        expect(screen.getByTestId('list-spacing').textContent).toBe('8');
        expect(screen.getByTestId('show-settings').textContent).toBe('false');
    });

    it('falls back to defaults when localStorage has no values', () => {
        const { matchMedia } = createMatchMediaMock(false);
        vi.stubGlobal('matchMedia', matchMedia);
        Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('open-link-in-new-tab').textContent).toBe('false');
        expect(screen.getByTestId('title-font-size').textContent).toBe('16');
        expect(screen.getByTestId('list-spacing').textContent).toBe('5');
    });
});

describe('SettingsProvider actions', () => {
    it('setTheme updates state and persists to localStorage', async () => {
        localStorage.setItem('theme', 'default');
        const user = userEvent.setup();

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        await user.click(screen.getByText('set-theme-night'));
        expect(screen.getByTestId('theme').textContent).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('toggleOpenLinksInNewTab flips and persists', async () => {
        localStorage.setItem('theme', 'default');
        const user = userEvent.setup();

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('open-link-in-new-tab').textContent).toBe('false');
        await user.click(screen.getByText('toggle-open'));
        expect(screen.getByTestId('open-link-in-new-tab').textContent).toBe('true');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        await user.click(screen.getByText('toggle-open'));
        expect(screen.getByTestId('open-link-in-new-tab').textContent).toBe('false');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('toggleSettings flips showSettings without writing localStorage', async () => {
        localStorage.setItem('theme', 'default');
        const user = userEvent.setup();

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('show-settings').textContent).toBe('false');
        await user.click(screen.getByText('toggle-settings'));
        expect(screen.getByTestId('show-settings').textContent).toBe('true');
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('setFont and setSpacing persist numeric values', async () => {
        localStorage.setItem('theme', 'default');
        const user = userEvent.setup();

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        await user.click(screen.getByText('set-font-20'));
        await user.click(screen.getByText('set-spacing-10'));
        expect(screen.getByTestId('title-font-size').textContent).toBe('20');
        expect(screen.getByTestId('list-spacing').textContent).toBe('10');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });
});

describe('SettingsProvider auto-detect dark mode', () => {
    it('uses prefers-color-scheme: dark when no theme is saved (matches=true)', () => {
        const { matchMedia } = createMatchMediaMock(true);
        Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
        expect(screen.getByTestId('theme').textContent).toBe('night');
    });

    it('uses default theme when prefers-color-scheme: dark does not match', () => {
        const { matchMedia } = createMatchMediaMock(false);
        Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
        expect(screen.getByTestId('theme').textContent).toBe('default');
    });

    it('responds to prefers-color-scheme change events', () => {
        const { matchMedia, listeners } = createMatchMediaMock(false);
        Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('theme').textContent).toBe('default');
        expect(listeners.length).toBe(1);

        act(() => {
            listeners[0]({ matches: true } as MediaQueryListEvent);
        });
        expect(screen.getByTestId('theme').textContent).toBe('night');
    });
});

describe('useSettings outside provider', () => {
    it('throws a clear error when used outside a SettingsProvider', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => render(<Consumer />)).toThrow(/SettingsProvider/);
        errorSpy.mockRestore();
    });
});
