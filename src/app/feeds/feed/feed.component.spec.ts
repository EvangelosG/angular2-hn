import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

function makeStories(count: number): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Story ${i + 1}`,
    points: 1,
    user: 'pg',
    time: 0,
    time_ago: 0,
    type: 'story',
    url: `https://example.com/${i + 1}`,
    domain: 'example.com',
    comments: [],
    comments_count: 0,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false
  }));
}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let params$: BehaviorSubject<Record<string, string>>;
  let fetchFeed: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    params$ = new BehaviorSubject<Record<string, string>>({ page: '2' });
    fetchFeed = vi.fn().mockReturnValue(of(makeStories(30)));
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [FeedComponent],
      providers: [
        provideRouter([]),
        { provide: HackerNewsAPIService, useValue: { fetchFeed } },
        {
          provide: SettingsService,
          useValue: {
            settings: { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' }
          }
        },
        { provide: ActivatedRoute, useValue: { data: of({ feedType: 'news' }), params: params$ } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
  });

  it('loads the feed for the current route and renders paging links', () => {
    fixture.detectChanges();

    expect(fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(fixture.componentInstance.listStart()).toBe(31);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelectorAll('li.post').length).toBe(30);
    expect(el.querySelector('ol').getAttribute('start')).toBe('31');
    expect(el.querySelector<HTMLAnchorElement>('a.prev').getAttribute('href')).toBe('/news/1');
    expect(el.querySelector<HTMLAnchorElement>('a.more').getAttribute('href')).toBe('/news/3');
  });

  it('hides the prev link on the first page and the more link on a short page', () => {
    fetchFeed.mockReturnValue(of(makeStories(5)));
    params$.next({});
    fixture.detectChanges();

    expect(fetchFeed).toHaveBeenLastCalledWith('news', 1);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('ol').getAttribute('start')).toBe('1');
    expect(el.querySelector('a.prev')).toBeNull();
    expect(el.querySelector('a.more')).toBeNull();
  });

  it('shows an error message when the feed fails to load', () => {
    fetchFeed.mockReturnValue(throwError(() => new Error('boom')));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.errorMessage()).toBe('Could not load news stories.');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message')).not.toBeNull();
    expect(el.querySelector('ol')).toBeNull();
  });
});
