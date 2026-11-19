import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { useSettings } from './SettingsContext';
import { SettingsProvider } from './SettingsProvider';
import { loadInitialSettings, settingsReducer } from './settingsReducer';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('settingsReducer', () => {
    const initial = loadInitialSettings();

    it('has the Angular defaults', () => {
        expect(initial).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('applies each action', () => {
        let state = settingsReducer(initial, { type: 'toggleSettings' });
        state = settingsReducer(state, { type: 'toggleOpenLinksInNewTab' });
        state = settingsReducer(state, { type: 'setTheme', theme: 'night' });
        state = settingsReducer(state, { type: 'setFont', fontSize: '20' });
        state = settingsReducer(state, { type: 'setSpacing', listSpace: '5' });
        expect(state).toEqual({
            showSettings: true,
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '20',
            listSpacing: '5',
        });
    });
});

describe('SettingsProvider', () => {
    it('restores saved settings from localStorage', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '18');
        localStorage.setItem('listSpacing', '4');
        const { result } = renderHook(useSettings, { wrapper });
        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '18',
            listSpacing: '4',
        });
    });

    it('persists changes under the same keys as the Angular app', () => {
        const { result } = renderHook(useSettings, { wrapper });
        act(() => result.current.setTheme('night'));
        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setFont('22'));
        act(() => result.current.setSpacing('3'));
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('3');
        expect(result.current.settings.theme).toBe('night');
    });

    it('uses the night theme when the system prefers dark and nothing is saved', () => {
        const original = window.matchMedia;
        window.matchMedia = (query: string) => ({ ...original(query), matches: true });
        try {
            const { result } = renderHook(useSettings, { wrapper });
            expect(result.current.settings.theme).toBe('night');
        } finally {
            window.matchMedia = original;
        }
    });
});
