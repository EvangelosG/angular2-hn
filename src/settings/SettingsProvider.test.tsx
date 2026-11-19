import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

type ChangeListener = (event: MediaQueryListEvent) => void;

function installMatchMedia(matches: boolean) {
    const listeners = new Set<ChangeListener>();
    const original = window.matchMedia;
    window.matchMedia = (query: string) =>
        ({
            matches,
            media: query,
            onchange: null,
            addEventListener: (_type: string, listener: ChangeListener) => listeners.add(listener),
            removeEventListener: (_type: string, listener: ChangeListener) => listeners.delete(listener),
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => true,
        }) as unknown as MediaQueryList;
    return {
        listeners,
        emit(nextMatches: boolean) {
            listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
        },
        restore() {
            window.matchMedia = original;
        },
    };
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsProvider', () => {
    it('uses defaults when nothing is stored and the system is light', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('restores persisted settings from localStorage', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '10');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '10',
        });
    });

    it('ignores an unknown stored theme and corrupt booleans', () => {
        localStorage.setItem('theme', 'neon');
        localStorage.setItem('openLinkInNewTab', '{oops');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('default');
        expect(result.current.settings.openLinkInNewTab).toBe(false);
    });

    it('uses the night theme when the system prefers dark and no theme is saved', () => {
        const media = installMatchMedia(true);
        try {
            const { result } = renderHook(() => useSettings(), { wrapper });
            expect(result.current.settings.theme).toBe('night');
        } finally {
            media.restore();
        }
    });

    it('follows system color scheme changes and unsubscribes on unmount', () => {
        const media = installMatchMedia(false);
        try {
            const { result, unmount } = renderHook(() => useSettings(), { wrapper });

            act(() => media.emit(true));
            expect(result.current.settings.theme).toBe('night');
            expect(localStorage.getItem('theme')).toBe('night');

            act(() => media.emit(false));
            expect(result.current.settings.theme).toBe('default');

            unmount();
            expect(media.listeners.size).toBe(0);
        } finally {
            media.restore();
        }
    });

    it('toggles the settings panel without persisting it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('persists every setter', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setTheme('night'));
        act(() => result.current.setFont('22'));
        act(() => result.current.setSpacing('5'));

        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '22',
            listSpacing: '5',
        });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('5');

        act(() => result.current.toggleOpenLinksInNewTab());
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('useSettings throws outside the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        // jsdom reports the render error as an uncaught window error; keep test output clean.
        const swallow = (event: ErrorEvent) => event.preventDefault();
        window.addEventListener('error', swallow);
        try {
            expect(() => renderHook(() => useSettings())).toThrow(
                'useSettings must be used within a SettingsProvider'
            );
        } finally {
            window.removeEventListener('error', swallow);
        }
    });
});
