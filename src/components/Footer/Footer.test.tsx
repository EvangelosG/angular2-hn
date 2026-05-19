import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders GitHub link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /GitHub/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
