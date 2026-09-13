/**
 * jsdom does not implement `window.matchMedia` or `MediaQueryListEvent`,
 * both of which SettingsService touches on construction.
 */
export function installMatchMediaStub(matches = false): void {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (media: string): MediaQueryList => {
      const target = new EventTarget();
      return {
        media,
        matches,
        onchange: null,
        addEventListener: target.addEventListener.bind(target),
        removeEventListener: target.removeEventListener.bind(target),
        dispatchEvent: target.dispatchEvent.bind(target),
        addListener: () => undefined,
        removeListener: () => undefined
      };
    };
  }

  if (typeof globalThis.MediaQueryListEvent === 'undefined') {
    class MediaQueryListEventStub extends Event {
      readonly media: string;
      readonly matches: boolean;

      constructor(type: string, init: MediaQueryListEventInit = {}) {
        super(type, init);
        this.media = init.media ?? '';
        this.matches = init.matches ?? false;
      }
    }
    globalThis.MediaQueryListEvent = MediaQueryListEventStub as unknown as typeof MediaQueryListEvent;
  }
}
