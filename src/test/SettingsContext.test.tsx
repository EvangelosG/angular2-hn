import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';

function TestConsumer() {
  const { settings, toggleSettings, setTheme } = useSettings();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="show">{String(settings.showSettings)}</span>
      <button onClick={toggleSettings}>toggle</button>
      <button onClick={() => setTheme('night')}>night</button>
    </div>
  );
}

describe('SettingsContext', () => {
  it('provides default settings', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    expect(screen.getByTestId('show').textContent).toBe('false');
  });

  it('toggles settings visibility', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('show').textContent).toBe('true');
  });

  it('changes theme', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('night'));
    expect(screen.getByTestId('theme').textContent).toBe('night');
  });
});
