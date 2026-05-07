import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Settings } from '../models';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: number) => void;
    setSpacing: (listSpace: number) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

function getInitialSettings(): Settings {
    const storedTheme = localStorage.getItem('theme');
    const storedFontSize = Number(localStorage.getItem('titleFontSize'));
    const storedSpacing = Number(localStorage.getItem('listSpacing'));
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab') === 'true',
        theme: storedTheme ?? '',
        titleFontSize: storedFontSize || 16,
        listSpacing: storedSpacing || 5,
    };
}

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<Settings>(() => getInitialSettings());

    useEffect(() => {
        if (settings.theme !== '') {
            return;
        }
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const applyScheme = (matches: boolean) => {
            setSettings((prev) => ({ ...prev, theme: matches ? 'night' : 'default' }));
        };
        applyScheme(darkScheme.matches);
        const handleChange = (event: MediaQueryListEvent) => {
            applyScheme(event.matches);
        };
        darkScheme.addEventListener('change', handleChange);
        return () => {
            darkScheme.removeEventListener('change', handleChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const next = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', String(next));
            return { ...prev, openLinkInNewTab: next };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    const setFont = useCallback((fontSize: number) => {
        setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', String(fontSize));
    }, []);

    const setSpacing = useCallback((listSpace: number) => {
        setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
        localStorage.setItem('listSpacing', String(listSpace));
    }, []);

    const value: SettingsContextValue = {
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (ctx === null) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
