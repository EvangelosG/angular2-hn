import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings, Theme } from '../models/settings';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: Theme) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function systemTheme(matchesDark: boolean): Theme {
    return matchesDark ? 'night' : 'default';
}

function loadInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const theme = savedTheme ?? systemTheme(window.matchMedia(DARK_SCHEME_QUERY).matches);
    if (!savedTheme) {
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
    const [settings, setSettings] = useState<Settings>(loadInitialSettings);

    const setTheme = useCallback((theme: Theme) => {
        localStorage.setItem('theme', theme);
        setSettings((s) => ({ ...s, theme }));
    }, []);

    useEffect(() => {
        const media = window.matchMedia(DARK_SCHEME_QUERY);
        const onChange = (event: MediaQueryListEvent) => setTheme(systemTheme(event.matches));
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            setTheme,
            toggleSettings: () => setSettings((s) => ({ ...s, showSettings: !s.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings((s) => {
                    const openLinkInNewTab = !s.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...s, openLinkInNewTab };
                }),
            setFont: (titleFontSize: string) => {
                localStorage.setItem('titleFontSize', titleFontSize);
                setSettings((s) => ({ ...s, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                localStorage.setItem('listSpacing', listSpacing);
                setSettings((s) => ({ ...s, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
