import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Settings } from '../models';
import { SettingsContext } from './settings-context';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function initialSettings(): Settings {
    const savedOpenLinkInNewTab = localStorage.getItem('openLinkInNewTab');

    return {
        showSettings: false,
        openLinkInNewTab: savedOpenLinkInNewTab ? (JSON.parse(savedOpenLinkInNewTab) as boolean) : false,
        theme: localStorage.getItem('theme') ?? 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    // Follow the system preferred color scheme as long as no theme has been saved yet.
    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia(DARK_COLOR_SCHEME_QUERY);

        const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        darkColorSchemeMedia.addEventListener('change', handleChange);

        if (!localStorage.getItem('theme')) {
            handleChange(darkColorSchemeMedia);
        }

        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo(
        () => ({
            settings,
            setTheme,
            toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings((current) => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                }),
            setFont: (titleFontSize: string) => {
                localStorage.setItem('titleFontSize', titleFontSize);
                setSettings((current) => ({ ...current, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                localStorage.setItem('listSpacing', listSpacing);
                setSettings((current) => ({ ...current, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext value={value}>{children}</SettingsContext>;
}
