import { TestBed } from '@angular/core/testing';

import { SavedStoriesService } from './saved-stories.service';
import { Story } from '../models/story';

function makeStory(id: number, title = `Story ${id}`): Story {
  return { id, title } as Story;
}

describe('SavedStoriesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  function create(): SavedStoriesService {
    return TestBed.inject(SavedStoriesService);
  }

  it('starts empty when nothing is stored', () => {
    const service = create();
    expect(service.getAll()).toEqual([]);
  });

  it('adds a story and reports it as saved', () => {
    const service = create();
    const story = makeStory(1);

    service.add(story);

    expect(service.isSaved(1)).toBe(true);
    expect(service.getAll()).toContain(story);
  });

  it('does not add the same story twice', () => {
    const service = create();
    const story = makeStory(1);

    service.add(story);
    service.add(story);

    expect(service.getAll().length).toBe(1);
  });

  it('removes a saved story', () => {
    const service = create();
    service.add(makeStory(1));

    service.remove(1);

    expect(service.isSaved(1)).toBe(false);
    expect(service.getAll()).toEqual([]);
  });

  it('remove is a no-op for an unsaved story', () => {
    const service = create();
    service.add(makeStory(1));

    service.remove(999);

    expect(service.getAll().length).toBe(1);
  });

  it('toggle saves an unsaved story and returns true', () => {
    const service = create();

    const result = service.toggle(makeStory(1));

    expect(result).toBe(true);
    expect(service.isSaved(1)).toBe(true);
  });

  it('toggle removes a saved story and returns false', () => {
    const service = create();
    const story = makeStory(1);
    service.add(story);

    const result = service.toggle(story);

    expect(result).toBe(false);
    expect(service.isSaved(1)).toBe(false);
  });

  it('persists saved stories across instances (localStorage)', () => {
    const first = create();
    first.add(makeStory(1));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const second = TestBed.inject(SavedStoriesService);

    expect(second.isSaved(1)).toBe(true);
  });

  it('returns an empty list when stored data is corrupt', () => {
    localStorage.setItem('savedStories', '{not valid json');

    const service = create();

    expect(service.getAll()).toEqual([]);
  });
});
