import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const defaultSettings: Settings = {
  showSettings: false,
  openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
    ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
    : false,
  theme: localStorage.getItem('theme') || 'default',
  titleFontSize: localStorage.getItem('titleFontSize') || '16',
  listSpacing: localStorage.getItem('listSpacing') || '0',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent) => {
    const theme = event.matches ? 'night' : 'default';
    setSettings((prev) => {
      localStorage.setItem('theme', theme);
      return { ...prev, theme };
    });
  }, []);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    // Init theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSettings((prev) => ({ ...prev, theme: savedTheme }));
    } else {
      if (darkColorSchemeMedia.matches) {
        setSettings((prev) => ({ ...prev, theme: 'night' }));
      }
    }

    // Subscribe to system preferred color scheme changes
    darkColorSchemeMedia.addEventListener('change', handleSystemPreferredColorSchemeChange);

    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleSystemPreferredColorSchemeChange);
    };
  }, [handleSystemPreferredColorSchemeChange]);

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
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
