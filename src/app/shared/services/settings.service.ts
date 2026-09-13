import { Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

const STORAGE_KEYS = {
  openLinkInNewTab: 'openLinkInNewTab',
  theme: 'theme',
  titleFontSize: 'titleFontSize',
  listSpacing: 'listSpacing',
} as const;

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  readonly showSettings = signal(false);
  readonly openLinkInNewTab = signal(readStoredBoolean(STORAGE_KEYS.openLinkInNewTab, false));
  readonly theme = signal(this.initialTheme());
  readonly titleFontSize = signal(localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16');
  readonly listSpacing = signal(localStorage.getItem(STORAGE_KEYS.listSpacing) || '0');

  constructor() {
    fromEvent<MediaQueryListEvent>(this.darkColorSchemeMedia, 'change')
      .pipe(takeUntilDestroyed())
      .subscribe(event => this.setTheme(systemTheme(event.matches)));
  }

  toggleSettings() {
    this.showSettings.update(shown => !shown);
  }

  toggleOpenLinksInNewTab() {
    this.openLinkInNewTab.update(open => !open);
    localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(this.openLinkInNewTab()));
  }

  setTheme(theme: string) {
    this.theme.set(theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }

  setFont(fontSize: string) {
    this.titleFontSize.set(fontSize);
    localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
  }

  setSpacing(listSpace: string) {
    this.listSpacing.set(listSpace);
    localStorage.setItem(STORAGE_KEYS.listSpacing, listSpace);
  }

  private initialTheme(): string {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme) {
      return savedTheme;
    }
    const theme = systemTheme(this.darkColorSchemeMedia.matches);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    return theme;
  }
}

function systemTheme(prefersDark: boolean): string {
  return prefersDark ? 'night' : 'default';
}

function readStoredBoolean(key: string, fallback: boolean): boolean {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
}
