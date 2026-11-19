import { THEMES, type Settings, type Theme } from '../models';

export const STORAGE_KEYS = {
    theme: 'theme',
    openLinkInNewTab: 'openLinkInNewTab',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export const DEFAULT_SETTINGS: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
};

export function readStorage(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function writeStorage(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Storage unavailable (private mode / quota); settings stay in memory.
    }
}

export function isTheme(value: unknown): value is Theme {
    return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function getDarkColorSchemeMedia(): MediaQueryList | null {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return null;
    }
    return window.matchMedia(DARK_COLOR_SCHEME_QUERY) ?? null;
}

export function systemTheme(prefersDark: boolean): Theme {
    return prefersDark ? 'night' : 'default';
}

function readBoolean(key: string, fallback: boolean): boolean {
    const raw = readStorage(key);
    if (raw === null) {
        return fallback;
    }
    try {
        return JSON.parse(raw) === true;
    } catch {
        return fallback;
    }
}

export function loadSettings(): Settings {
    const savedTheme = readStorage(STORAGE_KEYS.theme);
    return {
        showSettings: false,
        openLinkInNewTab: readBoolean(STORAGE_KEYS.openLinkInNewTab, DEFAULT_SETTINGS.openLinkInNewTab),
        theme: isTheme(savedTheme) ? savedTheme : systemTheme(Boolean(getDarkColorSchemeMedia()?.matches)),
        titleFontSize: readStorage(STORAGE_KEYS.titleFontSize) || DEFAULT_SETTINGS.titleFontSize,
        listSpacing: readStorage(STORAGE_KEYS.listSpacing) || DEFAULT_SETTINGS.listSpacing,
    };
}
