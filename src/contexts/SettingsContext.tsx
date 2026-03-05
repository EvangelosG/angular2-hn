import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings } from '../types/settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

function getInitialTheme(): string {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return darkColorSchemeMedia.matches ? 'night' : 'default';
}

function getInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: getInitialTheme(),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    // Listen for system theme changes
    useEffect(() => {
        const handler = (e: MediaQueryListEvent) => {
            // Only auto-switch if user hasn't manually set a theme
            if (!localStorage.getItem('theme')) {
                setSettings((prev) => ({
                    ...prev,
                    theme: e.matches ? 'night' : 'default',
                }));
            }
        };
        darkColorSchemeMedia.addEventListener('change', handler);
        return () => darkColorSchemeMedia.removeEventListener('change', handler);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const newVal = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
            return { ...prev, openLinkInNewTab: newVal };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem('titleFontSize', fontSize);
        setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        localStorage.setItem('listSpacing', listSpace);
        setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
    }, []);

    return (
        <SettingsContext.Provider
            value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextType {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
