import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { Settings } from '../models/settings';

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

  /**
   * Shared, mutated in place: consumers alias this object and read its fields
   * from their templates, so it must stay the same reference for the lifetime
   * of the service.
   */
  readonly settings: Settings = {
    showSettings: false,
    openLinkInNewTab: readStoredBoolean(STORAGE_KEYS.openLinkInNewTab, false),
    theme: 'default',
    titleFontSize: localStorage.getItem(STORAGE_KEYS.titleFontSize) || '16',
    listSpacing: localStorage.getItem(STORAGE_KEYS.listSpacing) || '0',
  };

  constructor() {
    this.initTheme();
    fromEvent<MediaQueryListEvent>(this.darkColorSchemeMedia, 'change')
      .pipe(takeUntilDestroyed())
      .subscribe(event => this.setTheme(systemTheme(event.matches)));
  }

  toggleSettings() {
    this.settings.showSettings = !this.settings.showSettings;
  }

  toggleOpenLinksInNewTab() {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
    localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(this.settings.openLinkInNewTab));
  }

  setTheme(theme: string) {
    this.settings.theme = theme;
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }

  setFont(fontSize: string) {
    this.settings.titleFontSize = fontSize;
    localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
  }

  setSpacing(listSpace: string) {
    this.settings.listSpacing = listSpace;
    localStorage.setItem(STORAGE_KEYS.listSpacing, listSpace);
  }

  private initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme) {
      this.settings.theme = savedTheme;
    } else {
      this.setTheme(systemTheme(this.darkColorSchemeMedia.matches));
    }
  }
}

function systemTheme(prefersDark: boolean): string {
  return prefersDark ? 'night' : 'default';
}

function readStoredBoolean(key: string, fallback: boolean): boolean {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
}
