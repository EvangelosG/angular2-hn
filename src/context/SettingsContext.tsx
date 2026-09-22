import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';

import { Settings } from '../models/settings';

export const STORAGE_KEYS = {
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
    openLinkInNewTab: 'openLinkInNewTab',
} as const;

export interface SettingsContextValue {
    settings: Settings;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function readOpenLinkInNewTab(): boolean {
    const stored = localStorage.getItem(STORAGE_KEYS.openLinkInNewTab);
    if (!stored) {
        return false;
    }
    try {
        return JSON.parse(stored) as boolean;
    } catch {
        return false;
    }
}

function initialSettings(): Settings {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    const prefersDark =
        typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
        showSettings: false,
        openLinkInNewTab: readOpenLinkInNewTab(),
        theme: savedTheme ? savedTheme : prefersDark ? 'night' : 'default',
        titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) ?? '16',
        listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const hadSavedTheme = useRef(localStorage.getItem(STORAGE_KEYS.theme) !== null);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem(STORAGE_KEYS.theme, theme);
        hadSavedTheme.current = true;
        setSettings((current) => ({ ...current, theme }));
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
        setSettings((current) => ({ ...current, titleFontSize: fontSize }));
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        localStorage.setItem(STORAGE_KEYS.listSpacing, listSpace);
        setSettings((current) => ({ ...current, listSpacing: listSpace }));
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((current) => {
            const openLinkInNewTab = !current.openLinkInNewTab;
            localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
            return { ...current, openLinkInNewTab };
        });
    }, []);

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') {
            return;
        }
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', handleChange);

        if (!hadSavedTheme.current) {
            setTheme(media.matches ? 'night' : 'default');
        }

        return () => media.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, setTheme, setFont, setSpacing, toggleSettings, toggleOpenLinksInNewTab }),
        [settings, setTheme, setFont, setSpacing, toggleSettings, toggleOpenLinksInNewTab]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
