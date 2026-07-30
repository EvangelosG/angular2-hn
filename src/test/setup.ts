import '@testing-library/jest-dom/vitest';

// jsdom implements neither scrollTo nor matchMedia, which the app uses to reset
// the scroll position and to read the system colour scheme preference.
window.scrollTo = () => {};

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
