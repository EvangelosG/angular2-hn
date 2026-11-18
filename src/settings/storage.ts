import type { Settings, Theme } from '../models/settings';

export const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
    theme: 'theme',
} as const;

export const DEFAULT_SETTINGS: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
};

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function getDarkColorSchemeMedia(): MediaQueryList | null {
    return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_SCHEME_QUERY) : null;
}

export function themeForColorScheme(prefersDark: boolean): Theme {
    return prefersDark ? 'night' : 'default';
}

function readOpenLinkInNewTab(): boolean {
    const saved = localStorage.getItem(STORAGE_KEYS.openLinkInNewTab);
    if (!saved) return DEFAULT_SETTINGS.openLinkInNewTab;
    try {
        return Boolean(JSON.parse(saved));
    } catch {
        return DEFAULT_SETTINGS.openLinkInNewTab;
    }
}

/** Mirrors the initial state of Angular's SettingsService. */
export function loadSettings(): Settings {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) as Theme | null;
    return {
        showSettings: false,
        openLinkInNewTab: readOpenLinkInNewTab(),
        theme: savedTheme || themeForColorScheme(getDarkColorSchemeMedia()?.matches ?? false),
        titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || DEFAULT_SETTINGS.titleFontSize,
        listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || DEFAULT_SETTINGS.listSpacing,
    };
}
