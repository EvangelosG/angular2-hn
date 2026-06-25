import { TestBed } from '@angular/core/testing';
import { BookmarksService } from './bookmarks.service';
import { Story } from '../models/story';

function makeStory(id: number, title: string = 'Test Story'): Story {
  const s = new Story();
  s.id = id;
  s.title = title;
  s.points = 10;
  s.user = 'testuser';
  s.time = Date.now();
  s.time_ago = 0;
  s.type = 'story';
  s.url = 'https://example.com';
  s.domain = 'example.com';
  s.comments = [];
  s.comments_count = 0;
  s.poll = [];
  s.poll_votes_count = 0;
  s.deleted = false;
  s.dead = false;
  return s;
}

describe('BookmarksService', () => {
  let service: BookmarksService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookmarksService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty bookmarks', () => {
    expect(service.count).toBe(0);
  });

  it('should add a bookmark', () => {
    const story = makeStory(1);
    service.add(story);
    expect(service.count).toBe(1);
    expect(service.isBookmarked(1)).toBe(true);
  });

  it('should not add duplicate bookmarks', () => {
    const story = makeStory(1);
    service.add(story);
    service.add(story);
    expect(service.count).toBe(1);
  });

  it('should remove a bookmark', () => {
    const story = makeStory(1);
    service.add(story);
    service.remove(1);
    expect(service.count).toBe(0);
    expect(service.isBookmarked(1)).toBe(false);
  });

  it('should toggle bookmark on', () => {
    const story = makeStory(1);
    service.toggle(story);
    expect(service.isBookmarked(1)).toBe(true);
  });

  it('should toggle bookmark off', () => {
    const story = makeStory(1);
    service.toggle(story);
    service.toggle(story);
    expect(service.isBookmarked(1)).toBe(false);
  });

  it('should persist bookmarks to localStorage', () => {
    const story = makeStory(42, 'Persisted Story');
    service.add(story);
    const stored = JSON.parse(localStorage.getItem('bookmarks'));
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe(42);
  });

  it('should load bookmarks from localStorage', () => {
    const story = makeStory(99, 'Loaded Story');
    localStorage.setItem('bookmarks', JSON.stringify([story]));
    const freshService = new BookmarksService();
    expect(freshService.isBookmarked(99)).toBe(true);
    expect(freshService.count).toBe(1);
  });

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('bookmarks', 'not-valid-json');
    const freshService = new BookmarksService();
    expect(freshService.count).toBe(0);
  });

  it('should emit updates via bookmarks$ observable', () => {
    const results: Story[][] = [];
    service.bookmarks$.subscribe(bookmarks => results.push(bookmarks));
    const story = makeStory(1);
    service.add(story);
    service.remove(1);
    expect(results.length).toBe(3);
    expect(results[0].length).toBe(0);
    expect(results[1].length).toBe(1);
    expect(results[2].length).toBe(0);
  });

  it('should prepend new bookmarks (newest first)', () => {
    service.add(makeStory(1, 'First'));
    service.add(makeStory(2, 'Second'));
    let latest: Story[];
    service.bookmarks$.subscribe(b => latest = b);
    expect(latest[0].id).toBe(2);
    expect(latest[1].id).toBe(1);
  });
});
