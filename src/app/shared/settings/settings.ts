import { createContext, useContext } from 'react';

import { Settings, Theme } from '../models/settings';

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

type SettingsAction =
    | { type: 'toggleSettings' }
    | { type: 'toggleOpenLinkInNewTab' }
    | { type: 'setTheme'; theme: Theme }
    | { type: 'setFont'; titleFontSize: string }
    | { type: 'setSpacing'; listSpacing: string };

export function settingsReducer(state: Settings, action: SettingsAction): Settings {
    switch (action.type) {
        case 'toggleSettings':
            return { ...state, showSettings: !state.showSettings };
        case 'toggleOpenLinkInNewTab':
            return { ...state, openLinkInNewTab: !state.openLinkInNewTab };
        case 'setTheme':
            return { ...state, theme: action.theme };
        case 'setFont':
            return { ...state, titleFontSize: action.titleFontSize };
        case 'setSpacing':
            return { ...state, listSpacing: action.listSpacing };
    }
}

function systemTheme(): Theme {
    return window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches ? 'night' : 'default';
}

export function loadSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
        theme: (localStorage.getItem('theme') as Theme | null) ?? systemTheme(),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: Theme) => void;
    setFont: (titleFontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
