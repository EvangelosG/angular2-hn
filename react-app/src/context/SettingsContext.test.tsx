import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MediaListener = (event: MediaQueryListEvent) => void;

const listeners = new Set<MediaListener>();
let prefersDark = false;

vi.stubGlobal(
  'matchMedia',
  vi.fn((media: string) => ({
    media,
    get matches() {
      return prefersDark;
    },
    addEventListener: (_: string, listener: MediaListener) => listeners.add(listener),
    removeEventListener: (_: string, listener: MediaListener) => listeners.delete(listener),
  }))
);

function emitColorSchemeChange(matches: boolean) {
  prefersDark = matches;
  act(() => {
    listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
  });
}

async function renderProvider() {
  const { SettingsProvider } = await import('./SettingsContext');
  const { useSettings } = await import('../hooks/useSettings');

  function Probe() {
    const { settings, toggleOpenLinksInNewTab, setFont, setSpacing, toggleSettings } = useSettings();
    return (
      <div>
        <span data-testid="theme">{settings.theme}</span>
        <span data-testid="newTab">{String(settings.openLinkInNewTab)}</span>
        <span data-testid="font">{settings.titleFontSize}</span>
        <span data-testid="spacing">{settings.listSpacing}</span>
        <span data-testid="showSettings">{String(settings.showSettings)}</span>
        <button onClick={toggleOpenLinksInNewTab}>new tab</button>
        <button onClick={toggleSettings}>settings</button>
        <button onClick={() => setFont('20')}>font</button>
        <button onClick={() => setSpacing('5')}>spacing</button>
      </div>
    );
  }

  render(
    <SettingsProvider>
      <Probe />
    </SettingsProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  listeners.clear();
  prefersDark = false;
  vi.resetModules();
});

describe('SettingsProvider', () => {
  it('derives the theme from the system preference when nothing is saved', async () => {
    prefersDark = true;
    await renderProvider();

    expect(screen.getByTestId('theme')).toHaveTextContent('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('prefers the saved theme over the system preference', async () => {
    prefersDark = true;
    localStorage.setItem('theme', 'amoledblack');
    await renderProvider();

    expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
  });

  it('follows system color scheme changes', async () => {
    await renderProvider();
    expect(screen.getByTestId('theme')).toHaveTextContent('default');

    emitColorSchemeChange(true);

    expect(screen.getByTestId('theme')).toHaveTextContent('night');
  });

  it('restores persisted settings', async () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '7');
    await renderProvider();

    expect(screen.getByTestId('newTab')).toHaveTextContent('true');
    expect(screen.getByTestId('font')).toHaveTextContent('22');
    expect(screen.getByTestId('spacing')).toHaveTextContent('7');
  });

  it('persists updated settings', async () => {
    await renderProvider();

    await userEvent.click(screen.getByRole('button', { name: 'new tab' }));
    await userEvent.click(screen.getByRole('button', { name: 'font' }));
    await userEvent.click(screen.getByRole('button', { name: 'spacing' }));

    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });

  it('toggles the settings modal without persisting it', async () => {
    await renderProvider();

    await userEvent.click(screen.getByRole('button', { name: 'settings' }));

    expect(screen.getByTestId('showSettings')).toHaveTextContent('true');
    expect(localStorage.getItem('showSettings')).toBeNull();
  });
});
