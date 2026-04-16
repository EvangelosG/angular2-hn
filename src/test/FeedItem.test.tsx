import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../contexts/SettingsContext';
import FeedItem from '../components/FeedItem';
import type { Story } from '../types/story';

const mockStory: Story = {
  id: 123,
  title: 'Test Story Title',
  points: 42,
  user: 'testuser',
  time: 1234567890,
  time_ago: 3,
  type: 'story',
  url: 'https://example.com',
  domain: 'example.com',
  comments: [],
  comments_count: 5,
  content: '',
  poll: [],
  poll_votes_count: 0,
  deleted: false,
  dead: false,
};

describe('FeedItem', () => {
  it('renders story title', () => {
    render(
      <SettingsProvider>
        <MemoryRouter>
          <FeedItem item={mockStory} />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(screen.getByText('Test Story Title')).toBeInTheDocument();
  });

  it('renders domain for external links', () => {
    render(
      <SettingsProvider>
        <MemoryRouter>
          <FeedItem item={mockStory} />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
  });

  it('renders user link', () => {
    render(
      <SettingsProvider>
        <MemoryRouter>
          <FeedItem item={mockStory} />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
  });
});
