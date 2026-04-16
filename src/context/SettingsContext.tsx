import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Settings } from '../types/settings';

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; theme: string }
  | { type: 'SET_FONT'; fontSize: string }
  | { type: 'SET_SPACING'; listSpace: string };

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

function getInitialSettings(): Settings {
  const savedTheme = localStorage.getItem('theme');
  const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab')!) as boolean
      : false,
    theme: savedTheme ?? (darkMediaQuery.matches ? 'night' : 'default'),
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB': {
      const newValue = !state.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
      return { ...state, openLinkInNewTab: newValue };
    }
    case 'SET_THEME':
      localStorage.setItem('theme', action.theme);
      return { ...state, theme: action.theme };
    case 'SET_FONT':
      localStorage.setItem('titleFontSize', action.fontSize);
      return { ...state, titleFontSize: action.fontSize };
    case 'SET_SPACING':
      localStorage.setItem('listSpacing', action.listSpace);
      return { ...state, listSpacing: action.listSpace };
  }
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, getInitialSettings);

  useEffect(() => {
    const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        dispatch({ type: 'SET_THEME', theme: event.matches ? 'night' : 'default' });
      }
    };
    darkMediaQuery.addEventListener('change', handler);
    return () => darkMediaQuery.removeEventListener('change', handler);
  }, []);

  const value: SettingsContextValue = {
    settings,
    toggleSettings: () => dispatch({ type: 'TOGGLE_SETTINGS' }),
    toggleOpenLinksInNewTab: () => dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }),
    setTheme: (theme: string) => dispatch({ type: 'SET_THEME', theme }),
    setFont: (fontSize: string) => dispatch({ type: 'SET_FONT', fontSize }),
    setSpacing: (listSpace: string) => dispatch({ type: 'SET_SPACING', listSpace }),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
