import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';

describe('Loader', () => {
  it('renders loading text', () => {
    render(<Loader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with correct class names', () => {
    const { container } = render(<Loader />);
    expect(container.querySelector('.loader-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.loading-section')).toBeInTheDocument();
    expect(container.querySelector('.loader')).toBeInTheDocument();
  });
});
