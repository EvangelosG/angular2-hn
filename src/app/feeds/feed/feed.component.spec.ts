import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { installMatchMediaStub } from '../../core/testing/match-media.stub';

function makeStory(id: number): Story {
  return {
    id,
    title: `Story ${id}`,
    points: 1,
    user: 'pg',
    time: 0,
    time_ago: '1 hour ago',
    type: 'story',
    url: 'https://example.com/' + id,
    domain: 'example.com',
    text: '',
    content: '',
    comments: [],
    comments_count: 0,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
  };
}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let params$: BehaviorSubject<Record<string, string>>;
  let fetchFeed: ReturnType<typeof vi.fn<(feedType: string, page: number) => Observable<Story[]>>>;

  beforeAll(() => installMatchMediaStub());

  beforeEach(async () => {
    params$ = new BehaviorSubject<Record<string, string>>({ page: '1' });
    fetchFeed = vi.fn<(feedType: string, page: number) => Observable<Story[]>>();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [FeedComponent],
      providers: [
        provideRouter([]),
        { provide: HackerNewsAPIService, useValue: { fetchFeed } },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ feedType: 'news' }), params: params$.asObservable() },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the loader until the feed arrives', async () => {
    fetchFeed.mockReturnValue(new Subject<Story[]>());
    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-loader')).not.toBeNull();
    expect(fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('renders items and pagination once loaded', async () => {
    const stories = Array.from({ length: 30 }, (_, i) => makeStory(i + 1));
    fetchFeed.mockReturnValue(of(stories));
    params$.next({ page: '2' });
    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('li.post').length).toBe(30);
    expect(el.querySelector('ol')?.getAttribute('start')).toBe('31');
    expect(el.querySelector('a.prev')?.getAttribute('href')).toBe('/news/1');
    expect(el.querySelector('a.more')?.getAttribute('href')).toBe('/news/3');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('hides prev on the first page and more on a short page', async () => {
    fetchFeed.mockReturnValue(of([makeStory(1)]));
    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('a.prev')).toBeNull();
    expect(el.querySelector('a.more')).toBeNull();
  });

  it('shows an error message when the fetch fails', async () => {
    fetchFeed.mockReturnValue(throwError(() => new Error('boom')));
    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message')?.textContent).toContain('Could not load news stories.');
  });

  it('refetches when the page param changes', async () => {
    fetchFeed.mockReturnValue(of([makeStory(1)]));
    fixture = TestBed.createComponent(FeedComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    params$.next({ page: '3' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fetchFeed).toHaveBeenLastCalledWith('news', 3);
    expect(fixture.componentInstance.pageNum()).toBe(3);
    expect(fixture.componentInstance.listStart()).toBe(61);
  });
});
