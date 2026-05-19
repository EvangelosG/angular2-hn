import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message text', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders offline viewing info', () => {
    render(<ErrorMessage message="Error" />);
    expect(
      screen.getByText(/you'll need to visit this page with a network connection/)
    ).toBeInTheDocument();
  });

  it('renders skull elements', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    expect(container.querySelector('.skull')).toBeInTheDocument();
    expect(container.querySelector('.head')).toBeInTheDocument();
    expect(container.querySelector('.mouth')).toBeInTheDocument();
  });
});
