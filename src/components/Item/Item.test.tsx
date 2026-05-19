import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../../context/SettingsContext';
import { Item } from './Item';
import { Story } from '../../types/story';

const mockStory: Story = {
  id: 123,
  title: 'Test Story Title',
  points: 42,
  user: 'testuser',
  time: 1234567890,
  time_ago: '3 hours ago',
  type: 'story',
  url: 'https://example.com/article',
  domain: 'example.com',
  content: '',
  comments: [],
  comments_count: 5,
  poll: [],
  poll_votes_count: 0,
  deleted: false,
  dead: false,
};

function renderItem(story: Story = mockStory) {
  return render(
    <SettingsProvider>
      <MemoryRouter>
        <Item item={story} />
      </MemoryRouter>
    </SettingsProvider>
  );
}

describe('Item', () => {
  it('renders story title', () => {
    renderItem();
    expect(screen.getAllByText('Test Story Title').length).toBeGreaterThan(0);
  });

  it('renders domain for external links', () => {
    renderItem();
    expect(screen.getAllByText('(example.com)').length).toBeGreaterThan(0);
  });

  it('renders user link', () => {
    renderItem();
    expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
  });

  it('renders comment count', () => {
    renderItem();
    expect(screen.getAllByText(/5 comments/).length).toBeGreaterThan(0);
  });

  it('renders time ago', () => {
    renderItem();
    expect(screen.getAllByText(/3 hours ago/).length).toBeGreaterThan(0);
  });

  it('does not render points for job type', () => {
    const jobStory: Story = { ...mockStory, type: 'job' };
    renderItem(jobStory);
    expect(screen.queryByText(/42 points/)).not.toBeInTheDocument();
  });
});
