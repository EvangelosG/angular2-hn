import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsProvider, useSettings } from './SettingsContext';

function TestConsumer() {
  const { settings, dispatch } = useSettings();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="font">{settings.titleFontSize}</span>
      <span data-testid="spacing">{settings.listSpacing}</span>
      <span data-testid="newTab">{String(settings.openLinkInNewTab)}</span>
      <span data-testid="showSettings">{String(settings.showSettings)}</span>
      <button onClick={() => dispatch({ type: 'SET_THEME', payload: 'night' })}>night</button>
      <button onClick={() => dispatch({ type: 'SET_FONT', payload: '20' })}>font20</button>
      <button onClick={() => dispatch({ type: 'SET_SPACING', payload: '5' })}>spacing5</button>
      <button onClick={() => dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' })}>toggleTab</button>
      <button onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}>toggleSettings</button>
    </div>
  );
}

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default settings', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    expect(screen.getByTestId('font').textContent).toBe('16');
    expect(screen.getByTestId('spacing').textContent).toBe('0');
    expect(screen.getByTestId('newTab').textContent).toBe('false');
    expect(screen.getByTestId('showSettings').textContent).toBe('false');
  });

  it('dispatches SET_THEME', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('night'));
    expect(screen.getByTestId('theme').textContent).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('dispatches SET_FONT', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('font20'));
    expect(screen.getByTestId('font').textContent).toBe('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
  });

  it('dispatches SET_SPACING', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('spacing5'));
    expect(screen.getByTestId('spacing').textContent).toBe('5');
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });

  it('dispatches TOGGLE_OPEN_LINKS_IN_NEW_TAB', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('toggleTab'));
    expect(screen.getByTestId('newTab').textContent).toBe('true');
  });

  it('dispatches TOGGLE_SETTINGS', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('toggleSettings'));
    expect(screen.getByTestId('showSettings').textContent).toBe('true');
  });
});
