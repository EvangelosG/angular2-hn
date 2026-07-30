import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../api/hackerNews';
import { SettingsProvider } from '../../context/SettingsContext';
import { Story } from '../../types';
import Feed from './Feed';

function story(id: number): Story {
  return {
    id,
    title: `Story ${id}`,
    points: 10,
    user: 'someone',
    time: 0,
    time_ago: 0,
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    content: '',
    text: '',
    comments: [],
    comments_count: 2,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
  } as unknown as Story;
}

function renderFeed(path: string) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:feedType/:page" element={<Feed />} />
        </Routes>
      </MemoryRouter>
    </SettingsProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Feed', () => {
  it('renders the stories returned for the requested feed and page', async () => {
    const fetchFeed = vi.spyOn(api, 'fetchFeed').mockResolvedValue([story(1), story(2)]);

    renderFeed('/news/2');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(screen.getByText('Story 2')).toBeInTheDocument();
    expect(fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
  });

  it('shows an error message when the feed cannot be loaded', async () => {
    vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('offline'));

    renderFeed('/show/1');

    expect(await screen.findByText('Could not load show stories.')).toBeInTheDocument();
  });
});
