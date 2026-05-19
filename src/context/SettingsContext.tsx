import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { Settings } from '../types/settings';

type SettingsAction =
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_FONT'; payload: string }
  | { type: 'SET_SPACING'; payload: string };

interface SettingsContextType {
  settings: Settings;
  dispatch: React.Dispatch<SettingsAction>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function getInitialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
      ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
      : false,
    theme: localStorage.getItem('theme') || 'default',
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
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
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, getInitialSettings);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      const theme = darkMedia.matches ? 'night' : 'default';
      dispatch({ type: 'SET_THEME', payload: theme });
    }
  }, []);

  useEffect(() => {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_THEME', payload: e.matches ? 'night' : 'default' });
    };
    darkMedia.addEventListener('change', handler);
    return () => darkMedia.removeEventListener('change', handler);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, dispatch }}>
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
