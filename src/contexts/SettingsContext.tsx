import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Settings } from '../types/settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

function getInitialSettings(): Settings {
    const savedTheme = localStorage.getItem('theme');
    const darkMediaMatch = window.matchMedia('(prefers-color-scheme: dark)');
    let theme: string;
    if (savedTheme) {
        theme = savedTheme;
    } else if (darkMediaMatch.matches) {
        theme = 'night';
    } else {
        theme = 'default';
    }

    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme,
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings(): SettingsContextType {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const handleColorSchemeChange = useCallback((event: MediaQueryListEvent) => {
        const newTheme = event.matches ? 'night' : 'default';
        setSettings((prev) => {
            localStorage.setItem('theme', newTheme);
            return { ...prev, theme: newTheme };
        });
    }, []);

    const handlerRef = useRef(handleColorSchemeChange);
    handlerRef.current = handleColorSchemeChange;

    useEffect(() => {
        const handler = (e: MediaQueryListEvent) => handlerRef.current(e);
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
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
        setSettings((prev) => {
            localStorage.setItem('theme', theme);
            return { ...prev, theme };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((prev) => {
            localStorage.setItem('titleFontSize', fontSize);
            return { ...prev, titleFontSize: fontSize };
        });
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings((prev) => {
            localStorage.setItem('listSpacing', listSpace);
            return { ...prev, listSpacing: listSpace };
        });
    }, []);

    return (
        <SettingsContext.Provider
            value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
