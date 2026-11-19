import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

type Listener = (event: MediaQueryListEvent) => void;

function stubColorScheme(dark: boolean) {
    const listeners = new Set<Listener>();
    const original = window.matchMedia;
    window.matchMedia = (query: string) =>
        ({
            matches: dark,
            media: query,
            addEventListener: (_: string, l: Listener) => listeners.add(l),
            removeEventListener: (_: string, l: Listener) => listeners.delete(l),
        }) as unknown as MediaQueryList;
    return {
        listeners,
        emit: (matches: boolean) => listeners.forEach((l) => l({ matches } as MediaQueryListEvent)),
        restore: () => (window.matchMedia = original),
    };
}

describe('SettingsContext', () => {
    it('uses defaults when nothing is stored', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('restores persisted settings', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '4');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '4',
        });
    });

    it('persists changes to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setTheme('night'));
        act(() => result.current.setFont('18'));
        act(() => result.current.setSpacing('6'));
        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '18',
            listSpacing: '6',
        });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('6');
    });

    it('toggles the settings panel without persisting it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('follows the system colour scheme and removes its listener on unmount', () => {
        const media = stubColorScheme(true);
        try {
            const { result, unmount } = renderHook(() => useSettings(), { wrapper });
            expect(result.current.settings.theme).toBe('night');
            act(() => media.emit(false));
            expect(result.current.settings.theme).toBe('default');
            expect(localStorage.getItem('theme')).toBe('default');
            unmount();
            expect(media.listeners.size).toBe(0);
        } finally {
            media.restore();
        }
    });
});
