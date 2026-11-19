export type Theme = 'default' | 'night' | 'amoledblack';

export interface Settings {
    showSettings: boolean;
    openLinkInNewTab: boolean;
    theme: Theme | string;
    titleFontSize: string;
    listSpacing: string;
}
