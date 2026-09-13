import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 42,
    title: 'A story',
    points: 10,
    user: 'alice',
    time: 0,
    time_ago: 0,
    type: 'link',
    url: 'https://example.com/a',
    domain: 'example.com',
    comments: [],
    comments_count: 0,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides
  } as Story;
}

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let params$: Subject<{ id: string }>;
  let api: { fetchItemContent: ReturnType<typeof vi.fn> };
  let location: { back: ReturnType<typeof vi.fn> };
  let settings: { openLinkInNewTab: boolean };

  beforeEach(async () => {
    params$ = new Subject();
    api = { fetchItemContent: vi.fn() };
    location = { back: vi.fn() };
    settings = { openLinkInNewTab: false };
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [ItemDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } },
        { provide: HackerNewsAPIService, useValue: api },
        { provide: SettingsService, useValue: { settings } },
        { provide: Location, useValue: location }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the loader until the item arrives', () => {
    api.fetchItemContent.mockReturnValue(of(makeStory()));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.item')).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    params$.next({ id: '42' });
    fixture.detectChanges();

    expect(api.fetchItemContent).toHaveBeenCalledWith(42);
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.item')).not.toBeNull();
  });

  it('renders an external link for stories with an http url', () => {
    api.fetchItemContent.mockReturnValue(of(makeStory()));
    fixture.detectChanges();
    params$.next({ id: '42' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector<HTMLAnchorElement>('.laptop a.title')!;
    expect(fixture.componentInstance.hasUrl()).toBe(true);
    expect(link.getAttribute('href')).toBe('https://example.com/a');
    expect(link.getAttribute('target')).toBeNull();
    expect(el.querySelector('.domain')?.textContent).toBe('(example.com)');
  });

  it('opens external links in a new tab when the setting is on', () => {
    settings.openLinkInNewTab = true;
    api.fetchItemContent.mockReturnValue(of(makeStory()));
    fixture.detectChanges();
    params$.next({ id: '42' });
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('.laptop a.title') as HTMLAnchorElement;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  it('renders an internal link for self posts without an http url', () => {
    api.fetchItemContent.mockReturnValue(of(makeStory({ url: 'item?id=42', domain: undefined })));
    fixture.detectChanges();
    params$.next({ id: '42' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.hasUrl()).toBe(false);
    expect(el.querySelector('.laptop a.title')?.getAttribute('href')).toBe('/item/42');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('renders the comment count and one app-comment per top-level comment', () => {
    api.fetchItemContent.mockReturnValue(
      of(
        makeStory({
          comments_count: 2,
          comments: [
            { id: 1, level: 0, user: 'bob', time: 0, time_ago: '1h', content: 'a', deleted: false, comments: [] },
            { id: 2, level: 0, user: 'carol', time: 0, time_ago: '2h', content: 'b', deleted: false, comments: [] }
          ]
        })
      )
    );
    fixture.detectChanges();
    params$.next({ id: '42' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.subtext')?.textContent).toContain('2 comments');
    expect(el.querySelectorAll('.comment-list app-comment').length).toBe(2);
  });

  it('hides points and comment count for jobs', () => {
    api.fetchItemContent.mockReturnValue(of(makeStory({ type: 'job' })));
    fixture.detectChanges();
    params$.next({ id: '42' });
    fixture.detectChanges();

    const subtext = fixture.nativeElement.querySelector('.subtext') as HTMLElement;
    expect(subtext.textContent).not.toContain('points by');
    expect(subtext.textContent).not.toContain('|');
  });

  it('shows an error message when loading fails', () => {
    api.fetchItemContent.mockReturnValue(throwError(() => new Error('boom')));
    fixture.detectChanges();
    params$.next({ id: '42' });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.errorMessage()).toBe('Could not load item comments.');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message')).not.toBeNull();
  });

  it('navigates back when the back button is used', () => {
    api.fetchItemContent.mockReturnValue(of(makeStory()));
    fixture.detectChanges();
    params$.next({ id: '42' });
    fixture.detectChanges();

    const back = fixture.nativeElement.querySelector('.back-button') as HTMLElement;
    back.click();
    expect(location.back).toHaveBeenCalledTimes(1);

    back.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(location.back).toHaveBeenCalledTimes(2);
  });
});
