export type Theme = 'default' | 'night' | 'amoledblack';

export const THEMES: readonly Theme[] = ['default', 'night', 'amoledblack'];

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: Theme;
    /** Pixel size as a string, e.g. '16' */
    titleFontSize: string;
    /** Pixel spacing as a string, e.g. '0' */
    listSpacing: string;
}
