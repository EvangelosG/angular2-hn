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
  theme: 'default',
  titleFontSize: localStorage.getItem('titleFontSize') || '16',
  listSpacing: localStorage.getItem('listSpacing') || '0',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const handleSystemPreferredColorSchemeChange = useCallback((event: MediaQueryListEvent | MediaQueryList) => {
    const theme = event.matches ? 'night' : 'default';
    setSettings(prev => {
      const updated = { ...prev, theme };
      localStorage.setItem('theme', theme);
      return updated;
    });
  }, []);

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSettings(prev => ({ ...prev, theme: savedTheme }));
    } else {
      handleSystemPreferredColorSchemeChange(darkColorSchemeMedia);
    }

    const handler = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        handleSystemPreferredColorSchemeChange(event);
      }
    };
    darkColorSchemeMedia.addEventListener('change', handler);
    return () => darkColorSchemeMedia.removeEventListener('change', handler);
  }, [handleSystemPreferredColorSchemeChange]);

  const toggleSettings = () => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  };

  const toggleOpenLinksInNewTab = () => {
    setSettings(prev => {
      const newVal = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...prev, openLinkInNewTab: newVal };
    });
  };

  const setTheme = (theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  };

  const setFont = (fontSize: string) => {
    setSettings(prev => ({ ...prev, titleFontSize: fontSize }));
    localStorage.setItem('titleFontSize', fontSize);
  };

  const setSpacing = (listSpace: string) => {
    setSettings(prev => ({ ...prev, listSpacing: listSpace }));
    localStorage.setItem('listSpacing', listSpace);
  };

  return (
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
