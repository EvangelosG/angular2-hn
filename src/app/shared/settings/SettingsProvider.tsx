import { ReactNode, useCallback, useEffect, useMemo, useReducer } from 'react';

import { Theme } from '../models/settings';
import { DARK_COLOR_SCHEME_QUERY, loadSettings, SettingsContext, SettingsContextValue, settingsReducer } from './settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, dispatch] = useReducer(settingsReducer, undefined, loadSettings);

    const setTheme = useCallback((theme: Theme) => {
        localStorage.setItem('theme', theme);
        dispatch({ type: 'setTheme', theme });
    }, []);

    useEffect(() => {
        const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
        if (!localStorage.getItem('theme')) {
            setTheme(media.matches ? 'night' : 'default');
        }
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            setTheme,
            toggleSettings: () => dispatch({ type: 'toggleSettings' }),
            toggleOpenLinksInNewTab: () => {
                localStorage.setItem('openLinkInNewTab', JSON.stringify(!settings.openLinkInNewTab));
                dispatch({ type: 'toggleOpenLinkInNewTab' });
            },
            setFont: (titleFontSize: string) => {
                localStorage.setItem('titleFontSize', titleFontSize);
                dispatch({ type: 'setFont', titleFontSize });
            },
            setSpacing: (listSpacing: string) => {
                localStorage.setItem('listSpacing', listSpacing);
                dispatch({ type: 'setSpacing', listSpacing });
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
