import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Settings } from '../types/settings';

interface SettingsContextValue extends Settings {
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (font: string) => void;
  setSpacing: (spacing: string) => void;
}

function getInitialSettings(): Settings {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab') === 'true',
    theme: localStorage.getItem('theme') || (prefersDark ? 'dark-theme' : ''),
    titleFontSize: localStorage.getItem('titleFontSize') || '',
    listSpacing: localStorage.getItem('listSpacing') || '',
  };
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  const toggleSettings = useCallback(() => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleOpenLinksInNewTab = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', String(next));
      return { ...prev, openLinkInNewTab: next };
    });
  }, []);

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setFont = useCallback((font: string) => {
    localStorage.setItem('titleFontSize', font);
    setSettings((prev) => ({ ...prev, titleFontSize: font }));
  }, []);

  const setSpacing = useCallback((spacing: string) => {
    localStorage.setItem('listSpacing', spacing);
    setSettings((prev) => ({ ...prev, listSpacing: spacing }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
