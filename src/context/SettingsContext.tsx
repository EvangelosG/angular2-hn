import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models/settings';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
};

function readInitialSettings(): Settings {
    const storedOpenLink = localStorage.getItem(STORAGE_KEYS.openLinkInNewTab);
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    const storedFontSize = localStorage.getItem(STORAGE_KEYS.titleFontSize);
    const storedListSpacing = localStorage.getItem(STORAGE_KEYS.listSpacing);

    let initialTheme = 'default';
    if (storedTheme) {
        initialTheme = storedTheme;
    } else if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialTheme = prefersDark ? 'night' : 'default';
    }

    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLink ? (JSON.parse(storedOpenLink) as boolean) : false,
        theme: initialTheme,
        titleFontSize: storedFontSize ?? '16',
        listSpacing: storedListSpacing ?? '0',
    };
}

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<Settings>(() => readInitialSettings());

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return;
        }
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => {
            const next = event.matches ? 'night' : 'default';
            setSettings((prev) => {
                const updated = { ...prev, theme: next };
                localStorage.setItem(STORAGE_KEYS.theme, next);
                return updated;
            });
        };
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const next = !prev.openLinkInNewTab;
            localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(next));
            return { ...prev, openLinkInNewTab: next };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => {
            localStorage.setItem(STORAGE_KEYS.theme, theme);
            return { ...prev, theme };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((prev) => {
            localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
            return { ...prev, titleFontSize: fontSize };
        });
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings((prev) => {
            localStorage.setItem(STORAGE_KEYS.listSpacing, listSpace);
            return { ...prev, listSpacing: listSpace };
        });
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
