import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Settings } from '../models/settings';

const DEFAULT_THEME = 'default';
const DARK_THEME = 'night';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function prefersDarkColorScheme(): MediaQueryList {
    return window.matchMedia('(prefers-color-scheme: dark)');
}

function readStoredSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const storedTheme = localStorage.getItem('theme');
    const theme = storedTheme || (prefersDarkColorScheme().matches ? DARK_THEME : DEFAULT_THEME);

    if (!storedTheme) {
        localStorage.setItem('theme', theme);
    }

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme,
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readStoredSettings);

    const setTheme = useCallback((theme: string) => {
        setSettings((current) => ({ ...current, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = prefersDarkColorScheme();
        const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? DARK_THEME : DEFAULT_THEME);

        darkColorSchemeMedia.addEventListener('change', handleChange);

        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            setTheme,
            toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings((current) => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                }),
            setFont: (titleFontSize: string) => {
                setSettings((current) => ({ ...current, titleFontSize }));
                localStorage.setItem('titleFontSize', titleFontSize);
            },
            setSpacing: (listSpacing: string) => {
                setSettings((current) => ({ ...current, listSpacing }));
                localStorage.setItem('listSpacing', listSpacing);
            },
        }),
        [settings, setTheme]
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
