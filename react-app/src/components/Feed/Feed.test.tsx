import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Feed } from './Feed';
import { SettingsProvider } from '../../context/SettingsContext';
import type { Story } from '../../models/story';

const { fetchFeed } = vi.hoisted(() => ({ fetchFeed: vi.fn() }));

vi.mock('../../api/hackernews', () => ({ fetchFeed }));

function buildStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A story',
    points: 10,
    user: 'pg',
    time: 0,
    time_ago: '1 hour ago',
    type: 'story',
    url: 'https://example.com',
    domain: 'example.com',
    content: '',
    text: '',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  };
}

function renderFeed(feedType = 'news', page = '2') {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
        <Routes>
          <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
        </Routes>
      </MemoryRouter>
    </SettingsProvider>
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('Feed', () => {
  it('renders stories for the current page and offsets the list', async () => {
    fetchFeed.mockResolvedValue([buildStory(), buildStory({ id: 2, title: 'Another story' })]);

    renderFeed();

    expect(await screen.findByRole('link', { name: 'A story' })).toBeInTheDocument();
    expect(fetchFeed).toHaveBeenCalledWith('news', 2, expect.any(AbortSignal));
    expect(screen.getByRole('list')).toHaveAttribute('start', '31');
  });

  it('links to the previous page but not the next one on a short page', async () => {
    fetchFeed.mockResolvedValue([buildStory()]);

    renderFeed();

    expect(await screen.findByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
    expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
  });

  it('links to the next page on a full page of stories', async () => {
    fetchFeed.mockResolvedValue(Array.from({ length: 30 }, (_, index) => buildStory({ id: index + 1 })));

    renderFeed();

    expect(await screen.findByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
  });

  it('shows an error message when the feed cannot be loaded', async () => {
    fetchFeed.mockRejectedValue(new Error('boom'));

    renderFeed('jobs', '1');

    expect(await screen.findByText('Could not load jobs stories.')).toBeInTheDocument();
  });
});
