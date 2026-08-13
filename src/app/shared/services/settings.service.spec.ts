import { SettingsService } from './settings.service';

class FakeMediaQueryList {
  media = '(prefers-color-scheme: dark)';
  matches = false;
  listeners: Array<(event: any) => void> = [];

  addEventListener(type: string, listener: (event: any) => void) {
    this.listeners.push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  dispatchEvent(event: any) {
    this.listeners.forEach(listener => listener(event));
    return true;
  }
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let media: FakeMediaQueryList;

  beforeEach(() => {
    store = {};
    media = new FakeMediaQueryList();

    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      store.hasOwnProperty(key) ? store[key] : null
    );
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(window, 'matchMedia').and.returnValue(media as any);
  });

  it('falls back to defaults when nothing is persisted', () => {
    const service = new SettingsService();

    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('restores persisted settings', () => {
    store = { openLinkInNewTab: 'true', titleFontSize: '20', listSpacing: '4', theme: 'amoledblack' };

    const service = new SettingsService();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('4');
    expect(service.settings.theme).toBe('amoledblack');
  });

  it('does not throw when localStorage holds corrupted json', () => {
    store = { openLinkInNewTab: '{not json' };

    let service: SettingsService;
    expect(() => (service = new SettingsService())).not.toThrow();
    expect(service.settings.openLinkInNewTab).toBe(false);
  });

  it('uses the saved theme instead of the system color scheme', () => {
    store = { theme: 'night' };
    media.matches = false;

    const service = new SettingsService();

    expect(service.settings.theme).toBe('night');
  });

  it('adopts the system color scheme when no theme is saved', () => {
    media.matches = true;

    const service = new SettingsService();

    expect(service.settings.theme).toBe('night');
    expect(store.theme).toBe('night');
  });

  it('adopts the default theme when the system prefers light', () => {
    media.matches = false;

    const service = new SettingsService();

    expect(service.settings.theme).toBe('default');
  });

  it('reacts to color scheme changes while subscribed', () => {
    store = { theme: 'default' };
    const service = new SettingsService();

    media.dispatchEvent({ matches: true });
    expect(service.settings.theme).toBe('night');

    media.dispatchEvent({ matches: false });
    expect(service.settings.theme).toBe('default');
  });

  it('removes the change listener when unsubscribing', () => {
    store = { theme: 'default' };
    const service = new SettingsService();
    expect(media.listeners.length).toBe(1);

    service.unSubscribeToSystemPrefferedColorScheme();

    expect(media.listeners.length).toBe(0);

    media.dispatchEvent({ matches: true });
    expect(service.settings.theme).toBe('default');
  });

  it('removes the change listener on destroy', () => {
    store = { theme: 'default' };
    const service = new SettingsService();

    service.ngOnDestroy();

    expect(media.listeners.length).toBe(0);
  });

  it('toggles the settings panel', () => {
    const service = new SettingsService();

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('persists the open-links-in-new-tab preference', () => {
    const service = new SettingsService();

    service.toggleOpenLinksInNewTab();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(store.openLinkInNewTab).toBe('true');
  });

  it('persists the theme', () => {
    const service = new SettingsService();

    service.setTheme('amoledblack');

    expect(service.settings.theme).toBe('amoledblack');
    expect(store.theme).toBe('amoledblack');
  });

  it('persists the title font size', () => {
    const service = new SettingsService();

    service.setFont('22');

    expect(service.settings.titleFontSize).toBe('22');
    expect(store.titleFontSize).toBe('22');
  });

  it('persists the list spacing', () => {
    const service = new SettingsService();

    service.setSpacing('6');

    expect(service.settings.listSpacing).toBe('6');
    expect(store.listSpacing).toBe('6');
  });
});
