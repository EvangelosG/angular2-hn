import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../contexts/SettingsContext';
import Header from '../components/Header';

describe('Header', () => {
  it('renders navigation links', () => {
    render(
      <SettingsProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getByText('show')).toBeInTheDocument();
    expect(screen.getByText('ask')).toBeInTheDocument();
    expect(screen.getByText('jobs')).toBeInTheDocument();
  });

  it('renders logo image', () => {
    render(
      <SettingsProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('renders settings icon', () => {
    render(
      <SettingsProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(screen.getByAltText('Settings')).toBeInTheDocument();
  });
});
