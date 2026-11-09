import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { Settings } from '../models/settings';
import { loadSettings, settingsReducer, useSettings } from './settings';
import { SettingsProvider } from './SettingsProvider';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

function mockColorScheme(dark: boolean) {
    const listeners: ((e: MediaQueryListEvent) => void)[] = [];
    vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
            ({
                matches: dark,
                media: query,
                addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
                removeEventListener: vi.fn(),
            }) as unknown as MediaQueryList
    );
    return (matches: boolean) => listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
}

describe('settingsReducer', () => {
    const base: Settings = {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
    };

    it('toggles the popup and new-tab flag', () => {
        expect(settingsReducer(base, { type: 'toggleSettings' }).showSettings).toBe(true);
        expect(settingsReducer(base, { type: 'toggleOpenLinkInNewTab' }).openLinkInNewTab).toBe(true);
    });

    it('sets theme, font size and spacing', () => {
        let state = settingsReducer(base, { type: 'setTheme', theme: 'amoledblack' });
        state = settingsReducer(state, { type: 'setFont', titleFontSize: '20' });
        state = settingsReducer(state, { type: 'setSpacing', listSpacing: '8' });
        expect(state).toMatchObject({ theme: 'amoledblack', titleFontSize: '20', listSpacing: '8' });
    });
});

describe('settings persistence', () => {
    afterEach(() => vi.restoreAllMocks());

    it('loads defaults when nothing is stored', () => {
        mockColorScheme(false);
        expect(loadSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('loads stored values using the Angular localStorage keys', () => {
        mockColorScheme(false);
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '5');
        localStorage.setItem('openLinkInNewTab', 'true');
        expect(loadSettings()).toMatchObject({
            theme: 'night',
            titleFontSize: '22',
            listSpacing: '5',
            openLinkInNewTab: true,
        });
    });

    it('persists changes made through the context', () => {
        mockColorScheme(false);
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.setTheme('amoledblack'));
        act(() => result.current.setFont('18'));
        act(() => result.current.setSpacing('4'));
        act(() => result.current.toggleOpenLinksInNewTab());

        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            titleFontSize: '18',
            listSpacing: '4',
            openLinkInNewTab: true,
        });
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('4');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('follows the system colour scheme when no theme is saved', () => {
        const emitChange = mockColorScheme(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => emitChange(false));
        expect(result.current.settings.theme).toBe('default');
    });
});
