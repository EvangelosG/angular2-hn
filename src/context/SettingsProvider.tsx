import { ReactNode, useCallback, useEffect, useState } from 'react';

import { Settings } from '../models/settings';
import { SettingsContext } from './settings-context';

const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

function getInitialSettings(): Settings {
    const storedOpenLink = localStorage.getItem('openLinkInNewTab');
    const savedTheme = localStorage.getItem('theme');

    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLink ? (JSON.parse(storedOpenLink) as boolean) : false,
        theme: savedTheme ? savedTheme : darkColorSchemeMedia.matches ? 'night' : 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    // Persist the initial system-derived theme when the user has no saved preference,
    // and keep the theme in sync with the OS colour scheme.
    useEffect(() => {
        if (!localStorage.getItem('theme')) {
            setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
        }

        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        darkColorSchemeMedia.addEventListener('change', handleChange);
        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
    }, [setTheme]);

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
