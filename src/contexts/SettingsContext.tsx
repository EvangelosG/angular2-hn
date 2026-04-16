import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { Settings } from '../types/settings';

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_FONT'; payload: string }
  | { type: 'SET_SPACING'; payload: string };

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
      : false,
    theme: localStorage.getItem('theme') ?? 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'TOGGLE_OPEN_LINKS_IN_NEW_TAB': {
      const newVal = !state.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
      return { ...state, openLinkInNewTab: newVal };
    }
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_FONT':
      localStorage.setItem('titleFontSize', action.payload);
      return { ...state, titleFontSize: action.payload };
    case 'SET_SPACING':
      localStorage.setItem('listSpacing', action.payload);
      return { ...state, listSpacing: action.payload };
    default:
      return state;
  }
}

interface SettingsContextValue {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, getInitialSettings);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      dispatch({ type: 'SET_THEME', payload: darkMedia.matches ? 'night' : 'default' });
    }

    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_THEME', payload: e.matches ? 'night' : 'default' });
    };
    darkMedia.addEventListener('change', handler);
    return () => darkMedia.removeEventListener('change', handler);
  }, []);

  const value: SettingsContextValue = {
    settings,
    toggleSettings: () => dispatch({ type: 'TOGGLE_SETTINGS' }),
    toggleOpenLinksInNewTab: () => dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }),
    setTheme: (theme: string) => dispatch({ type: 'SET_THEME', payload: theme }),
    setFont: (fontSize: string) => dispatch({ type: 'SET_FONT', payload: fontSize }),
    setSpacing: (listSpace: string) => dispatch({ type: 'SET_SPACING', payload: listSpace }),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
