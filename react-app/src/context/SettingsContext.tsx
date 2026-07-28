import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { SettingsContext } from './settings-context';
import type { SettingsContextValue } from './settings-context';
import type { Settings } from '../models/settings';

const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

function initialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
  const savedTheme = localStorage.getItem('theme');

  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: savedTheme ? savedTheme : darkColorSchemeMedia.matches ? 'night' : 'default',
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

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
    }
  }, [setTheme]);

  useEffect(() => {
    const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');

    darkColorSchemeMedia.addEventListener('change', handleChange);
    return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
  }, [setTheme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTheme,
      toggleSettings: () =>
        setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
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

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
