import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { installMatchMedia } from '../test/matchMediaMock';
import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

let media: ReturnType<typeof installMatchMedia> | undefined;
afterEach(() => {
    media?.restore();
    media = undefined;
});

describe('SettingsProvider', () => {
    it('uses the Angular defaults when nothing is stored', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads stored settings from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '10');
        localStorage.setItem('theme', 'amoledblack');

        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '10',
            theme: 'amoledblack',
        });
    });

    it('persists every setter to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        act(() => result.current.setOpenLinkInNewTab(false));
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');

        act(() => result.current.setTheme('night'));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => result.current.setTitleFontSize('24'));
        expect(result.current.settings.titleFontSize).toBe('24');
        expect(localStorage.getItem('titleFontSize')).toBe('24');

        act(() => result.current.setListSpacing('5'));
        expect(result.current.settings.listSpacing).toBe('5');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('toggles the settings panel without persisting it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        act(() => result.current.setShowSettings(false));
        expect(result.current.settings.showSettings).toBe(false);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('applies and saves the system dark theme when no theme is stored', () => {
        media = installMatchMedia(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('keeps a stored theme over the system preference', () => {
        media = installMatchMedia(true);
        localStorage.setItem('theme', 'default');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('default');
    });

    it('follows prefers-color-scheme changes and unsubscribes on unmount', () => {
        media = installMatchMedia(false);
        const { result, unmount } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('default');

        act(() => media!.setMatches(true));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => media!.setMatches(false));
        expect(result.current.settings.theme).toBe('default');

        unmount();
        expect(media.listenerCount()).toBe(0);
    });

    it('applies initialSettings overrides', () => {
        const { result } = renderHook(() => useSettings(), {
            wrapper: ({ children }) => (
                <SettingsProvider initialSettings={{ showSettings: true, theme: 'amoledblack' }}>{children}</SettingsProvider>
            ),
        });
        expect(result.current.settings.showSettings).toBe(true);
        expect(result.current.settings.theme).toBe('amoledblack');
    });

    it('shares state between consumers', async () => {
        function Toggle() {
            const { toggleSettings } = useSettings();
            return <button onClick={toggleSettings}>toggle</button>;
        }
        function Status() {
            const { settings } = useSettings();
            return <span>{settings.showSettings ? 'open' : 'closed'}</span>;
        }
        render(
            <SettingsProvider>
                <Toggle />
                <Status />
            </SettingsProvider>
        );
        expect(screen.getByText('closed')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        expect(screen.getByText('open')).toBeInTheDocument();
    });

    it('useSettings throws outside the provider', () => {
        expect(() => renderHook(() => useSettings())).toThrow(/SettingsProvider/);
    });
});
