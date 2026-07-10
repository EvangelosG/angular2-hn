import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';

import { Settings } from '../models/settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);
    const darkColorSchemeMedia = useRef<MediaQueryList | null>(null);

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    // Follow the system preferred color scheme (unless a theme was explicitly saved).
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        darkColorSchemeMedia.current = media;

        const applySystemScheme = (matches: boolean) => {
            setSettings((prev) => ({ ...prev, theme: matches ? 'night' : 'default' }));
        };

        const handleChange = (event: MediaQueryListEvent) => {
            // Persist changes driven by the system, mirroring the original setTheme behavior.
            const theme = event.matches ? 'night' : 'default';
            setSettings((prev) => ({ ...prev, theme }));
            localStorage.setItem('theme', theme);
        };

        media.addEventListener('change', handleChange);

        // initTheme: use saved theme, otherwise follow the current system preference.
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((prev) => ({ ...prev, theme: savedTheme }));
        } else {
            applySystemScheme(media.matches);
        }

        return () => media.removeEventListener('change', handleChange);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...prev, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
        localStorage.setItem('listSpacing', listSpace);
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
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
