export const THEMES = ['default', 'night', 'amoledblack'] as const;

/** Theme class name applied to the app's root element (see src/styles/_themes.scss). */
export type Theme = (typeof THEMES)[number];

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: Theme;
    /** Feed title font size in px, stored as a string (e.g. '16'). */
    titleFontSize: string;
    /** Margin between feed items in px, stored as a string (e.g. '0'). */
    listSpacing: string;
}
