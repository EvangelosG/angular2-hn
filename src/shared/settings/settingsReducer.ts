import type { Settings } from '../models/settings';

export type SettingsAction =
    | { type: 'toggleSettings' }
    | { type: 'toggleOpenLinksInNewTab' }
    | { type: 'setTheme'; theme: string }
    | { type: 'setFont'; fontSize: string }
    | { type: 'setSpacing'; listSpace: string };

export const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export function loadInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem(STORAGE_KEYS.openLinkInNewTab);
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: localStorage.getItem(STORAGE_KEYS.theme) || 'default',
        titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16',
        listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || '0',
    };
}

export function settingsReducer(state: Settings, action: SettingsAction): Settings {
    switch (action.type) {
        case 'toggleSettings':
            return { ...state, showSettings: !state.showSettings };
        case 'toggleOpenLinksInNewTab':
            return { ...state, openLinkInNewTab: !state.openLinkInNewTab };
        case 'setTheme':
            return { ...state, theme: action.theme };
        case 'setFont':
            return { ...state, titleFontSize: action.fontSize };
        case 'setSpacing':
            return { ...state, listSpacing: action.listSpace };
    }
}
