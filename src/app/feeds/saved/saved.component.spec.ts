import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { SavedComponent } from './saved.component';
import { BookmarksService } from '../../shared/services/bookmarks.service';
import { Story } from '../../shared/models/story';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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

describe('SavedComponent', () => {
  let component: SavedComponent;
  let fixture: ComponentFixture<SavedComponent>;
  let bookmarksSubject: BehaviorSubject<Story[]>;

  beforeEach(() => {
    localStorage.clear();
    bookmarksSubject = new BehaviorSubject<Story[]>([]);

    TestBed.configureTestingModule({
      declarations: [SavedComponent],
      providers: [
        {
          provide: BookmarksService,
          useValue: { bookmarks$: bookmarksSubject.asObservable() }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty bookmarks', () => {
    expect(component.bookmarks.length).toBe(0);
  });

  it('should display empty state when no bookmarks', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.empty')).toBeTruthy();
    expect(el.querySelector('.empty-title').textContent).toContain('No saved stories yet');
  });

  it('should update bookmarks when observable emits', () => {
    const stories = [makeStory(1, 'Story 1'), makeStory(2, 'Story 2')];
    bookmarksSubject.next(stories);
    fixture.detectChanges();
    expect(component.bookmarks.length).toBe(2);
  });

  it('should render list when bookmarks exist', () => {
    bookmarksSubject.next([makeStory(1)]);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('ol')).toBeTruthy();
    expect(el.querySelector('.empty')).toBeFalsy();
  });

  it('should unsubscribe on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
