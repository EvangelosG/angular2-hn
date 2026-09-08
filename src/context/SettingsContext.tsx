import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '@/models/settings';

/**
 * Port of src/app/shared/services/settings.service.ts.
 * Same localStorage keys / value formats: `openLinkInNewTab` (JSON boolean),
 * `titleFontSize` (string), `listSpacing` (string), `theme` (string).
 */
export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

const readInitialSettings = (): Settings => {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const titleFontSize = localStorage.getItem('titleFontSize');
    const listSpacing = localStorage.getItem('listSpacing');

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: 'default',
        titleFontSize: titleFontSize ? titleFontSize : '16',
        listSpacing: listSpacing ? listSpacing : '0'
    };
};

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readInitialSettings);

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

    // subscribeToSystemPreferredColorScheme + initTheme + cleanup
    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((prev) => ({ ...prev, theme: savedTheme }));
        } else {
            setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
        }

        return () => {
            darkColorSchemeMedia.removeEventListener(
                'change',
                handleSystemPreferredColorSchemeChange
            );
        };
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setFont,
            setSpacing
        }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
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
