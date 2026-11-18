import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings, Theme } from '../models/settings';
import { SettingsContext, type SettingsContextValue } from './SettingsContext';
import { STORAGE_KEYS, getDarkColorSchemeMedia, loadSettings, themeForColorScheme } from './storage';

export interface SettingsProviderProps {
    children: ReactNode;
    /** Overrides applied on top of the stored settings at mount (not persisted). Handy in tests. */
    initialSettings?: Partial<Settings>;
}

/** Port of Angular's SettingsService. */
export function SettingsProvider({ children, initialSettings }: SettingsProviderProps) {
    const [settings, setSettings] = useState<Settings>(() => ({ ...loadSettings(), ...initialSettings }));
    const [hasThemeOverride] = useState(() => initialSettings?.theme !== undefined);

    const setTheme = useCallback((theme: Theme) => {
        setSettings((current) => ({ ...current, theme }));
        localStorage.setItem(STORAGE_KEYS.theme, theme);
    }, []);

    // Angular's initTheme(): with no saved theme, apply (and save) the system color scheme.
    useEffect(() => {
        if (!hasThemeOverride && !localStorage.getItem(STORAGE_KEYS.theme)) {
            setTheme(themeForColorScheme(getDarkColorSchemeMedia()?.matches ?? false));
        }
    }, [hasThemeOverride, setTheme]);

    // Angular subscribes to prefers-color-scheme changes for the app's lifetime.
    useEffect(() => {
        const media = getDarkColorSchemeMedia();
        if (!media) return;
        const onChange = (event: MediaQueryListEvent) => setTheme(themeForColorScheme(event.matches));
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', onChange);
            return () => media.removeEventListener('change', onChange);
        }
        media.addListener?.(onChange);
        return () => media.removeListener?.(onChange);
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
    }, []);

    const setShowSettings = useCallback((showSettings: boolean) => {
        setSettings((current) => ({ ...current, showSettings }));
    }, []);

    const setOpenLinkInNewTab = useCallback((openLinkInNewTab: boolean) => {
        setSettings((current) => ({ ...current, openLinkInNewTab }));
        localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setOpenLinkInNewTab(!settings.openLinkInNewTab);
    }, [setOpenLinkInNewTab, settings.openLinkInNewTab]);

    const setTitleFontSize = useCallback((titleFontSize: string) => {
        setSettings((current) => ({ ...current, titleFontSize }));
        localStorage.setItem(STORAGE_KEYS.titleFontSize, titleFontSize);
    }, []);

    const setListSpacing = useCallback((listSpacing: string) => {
        setSettings((current) => ({ ...current, listSpacing }));
        localStorage.setItem(STORAGE_KEYS.listSpacing, listSpacing);
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings,
            setShowSettings,
            toggleOpenLinksInNewTab,
            setOpenLinkInNewTab,
            setTheme,
            setTitleFontSize,
            setListSpacing,
        }),
        [
            settings,
            toggleSettings,
            setShowSettings,
            toggleOpenLinksInNewTab,
            setOpenLinkInNewTab,
            setTheme,
            setTitleFontSize,
            setListSpacing,
        ]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
