import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings } from '../models/settings';
import { SettingsContext, type SettingsContextValue } from './settings-context';

const darkColorSchemeQuery = '(prefers-color-scheme: dark)';

function systemPreferredTheme(matches: boolean): string {
    return matches ? 'night' : 'default';
}

function readInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    const savedTheme = localStorage.getItem('theme');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: savedTheme ?? systemPreferredTheme(window.matchMedia(darkColorSchemeQuery).matches),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

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

    const setFont = useCallback((titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((prev) => ({ ...prev, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((prev) => ({ ...prev, listSpacing }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia(darkColorSchemeQuery);
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', systemPreferredTheme(darkColorSchemeMedia.matches));
        }
        const handleSystemPreferredColorSchemeChange = (event: MediaQueryListEvent) => {
            setTheme(systemPreferredTheme(event.matches));
        };
        darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);
        return () => darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
