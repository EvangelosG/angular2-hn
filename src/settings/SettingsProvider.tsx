import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Theme } from '../models';
import { SettingsContext, type SettingsContextValue } from './SettingsContext';
import { STORAGE_KEYS, getDarkColorSchemeMedia, loadSettings, systemTheme, writeStorage } from './storage';

export interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState(loadSettings);

    const setTheme = useCallback((theme: Theme) => {
        writeStorage(STORAGE_KEYS.theme, theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        const media = getDarkColorSchemeMedia();
        if (!media) {
            return;
        }
        const handleChange = (event: MediaQueryListEvent) => setTheme(systemTheme(event.matches));
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', handleChange);
            return () => media.removeEventListener('change', handleChange);
        }
        media.addListener?.(handleChange);
        return () => media.removeListener?.(handleChange);
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((current) => {
            const openLinkInNewTab = !current.openLinkInNewTab;
            writeStorage(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
            return { ...current, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        writeStorage(STORAGE_KEYS.titleFontSize, titleFontSize);
        setSettings((current) => ({ ...current, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        writeStorage(STORAGE_KEYS.listSpacing, listSpacing);
        setSettings((current) => ({ ...current, listSpacing }));
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
