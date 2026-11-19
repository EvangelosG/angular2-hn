import { useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { SettingsContext } from './SettingsContext';
import { loadInitialSettings, settingsReducer, STORAGE_KEYS } from './settingsReducer';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, dispatch] = useReducer(settingsReducer, undefined, loadInitialSettings);

    const actions = useMemo(() => {
        const setTheme = (theme: string) => {
            dispatch({ type: 'setTheme', theme });
            localStorage.setItem(STORAGE_KEYS.theme, theme);
        };
        return {
            setTheme,
            toggleSettings: () => dispatch({ type: 'toggleSettings' }),
            setFont: (fontSize: string) => {
                dispatch({ type: 'setFont', fontSize });
                localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
            },
            setSpacing: (listSpace: string) => {
                dispatch({ type: 'setSpacing', listSpace });
                localStorage.setItem(STORAGE_KEYS.listSpacing, listSpace);
            },
        };
    }, []);

    // Follow the system color scheme: apply it when no theme is saved yet, and on every system change.
    useEffect(() => {
        const media = window.matchMedia(DARK_SCHEME_QUERY);
        const apply = (matches: boolean) => actions.setTheme(matches ? 'night' : 'default');
        if (!localStorage.getItem(STORAGE_KEYS.theme)) {
            apply(media.matches);
        }
        const onChange = (event: MediaQueryListEvent) => apply(event.matches);
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [actions]);

    const value = useMemo(
        () => ({
            settings,
            ...actions,
            toggleOpenLinksInNewTab: () => {
                dispatch({ type: 'toggleOpenLinksInNewTab' });
                localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(!settings.openLinkInNewTab));
            },
        }),
        [settings, actions]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
