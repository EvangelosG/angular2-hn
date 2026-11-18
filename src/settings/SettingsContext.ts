import { createContext } from 'react';

import type { Settings, Theme } from '../models/settings';

export interface SettingsContextValue {
    settings: Settings;
    /** Angular `toggleSettings()` (shows/hides the settings panel) */
    toggleSettings: () => void;
    setShowSettings: (show: boolean) => void;
    /** Angular `toggleOpenLinksInNewTab()`; persisted */
    toggleOpenLinksInNewTab: () => void;
    /** persisted */
    setOpenLinkInNewTab: (openLinkInNewTab: boolean) => void;
    /** Angular `setTheme()`; persisted */
    setTheme: (theme: Theme) => void;
    /** Angular `setFont()`; persisted */
    setTitleFontSize: (titleFontSize: string) => void;
    /** Angular `setSpacing()`; persisted */
    setListSpacing: (listSpacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
