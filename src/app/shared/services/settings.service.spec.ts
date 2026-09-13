import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

type ChangeListener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(matches: boolean) {
  const listeners: ChangeListener[] = [];
  const mediaQueryList = {
    media: '(prefers-color-scheme: dark)',
    matches,
    addEventListener: (_type: string, listener: ChangeListener) => listeners.push(listener),
    removeEventListener: (_type: string, listener: ChangeListener) => {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    },
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryList));
  return {
    listeners,
    emitChange: (nowMatches: boolean) =>
      listeners.forEach(listener => listener({ matches: nowMatches } as MediaQueryListEvent)),
  };
}

describe('SettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses defaults when nothing is stored', () => {
    stubMatchMedia(false);
    const service = TestBed.inject(SettingsService);

    expect(service.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('restores stored settings', () => {
    stubMatchMedia(true);
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '8');

    const service = TestBed.inject(SettingsService);

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.theme).toBe('amoledblack');
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('8');
  });

  it('picks the night theme from the system preference when none is saved and persists it', () => {
    stubMatchMedia(true);
    const service = TestBed.inject(SettingsService);

    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('follows system color scheme changes', () => {
    const media = stubMatchMedia(false);
    const service = TestBed.inject(SettingsService);
    expect(service.settings.theme).toBe('default');

    media.emitChange(true);
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');

    media.emitChange(false);
    expect(service.settings.theme).toBe('default');
  });

  it('stops listening to system color scheme changes when destroyed', () => {
    const media = stubMatchMedia(false);
    TestBed.inject(SettingsService);
    expect(media.listeners).toHaveLength(1);

    TestBed.resetTestingModule();
    expect(media.listeners).toHaveLength(0);
  });

  it('mutates the shared settings object in place and persists changes', () => {
    stubMatchMedia(false);
    const service = TestBed.inject(SettingsService);
    const settings = service.settings;

    service.toggleSettings();
    expect(settings.showSettings).toBe(true);

    service.toggleOpenLinksInNewTab();
    expect(settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

    service.setTheme('amoledblack');
    expect(settings.theme).toBe('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');

    service.setFont('18');
    expect(settings.titleFontSize).toBe('18');
    expect(localStorage.getItem('titleFontSize')).toBe('18');

    service.setSpacing('4');
    expect(settings.listSpacing).toBe('4');
    expect(localStorage.getItem('listSpacing')).toBe('4');

    expect(service.settings).toBe(settings);
  });
});
