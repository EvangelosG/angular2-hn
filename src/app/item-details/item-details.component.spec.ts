import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, Subject, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 42,
    title: 'A story',
    points: 10,
    user: 'pg',
    time: 0,
    time_ago: 0,
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    text: '',
    content: '',
    comments: [],
    comments_count: 0,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides
  };
}

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let params: BehaviorSubject<{ id: string }>;
  let fetchItemContent: ReturnType<typeof vi.fn>;
  let settings: Settings;

  beforeEach(async () => {
    params = new BehaviorSubject({ id: '42' });
    fetchItemContent = vi.fn();
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [ItemDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: params.asObservable() } },
        { provide: HackerNewsAPIService, useValue: { fetchItemContent } },
        { provide: SettingsService, useValue: { settings } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
  });

  it('shows the loader until the item arrives, then renders it', async () => {
    const response = new Subject<Story>();
    fetchItemContent.mockReturnValue(response.asObservable());

    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(fetchItemContent).toHaveBeenCalledWith(42);
    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('.item')).toBeNull();

    response.next(makeStory());
    response.complete();
    fixture.detectChanges();

    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.laptop .title')?.getAttribute('href')).toBe('https://example.com/post');
    expect(el.querySelector('.domain')?.textContent).toBe('(example.com)');
    expect(el.querySelector('.laptop .subtext')?.textContent).toContain('10 points by');
    expect(el.querySelector('.laptop .subtext')?.textContent).toContain('discuss');
    expect(el.querySelector('.laptop .title')?.getAttribute('target')).toBeNull();
    expect(fixture.componentInstance.hasUrl()).toBe(true);
  });

  it('opens external links in a new tab when the setting is enabled', async () => {
    settings.openLinkInNewTab = true;
    fetchItemContent.mockReturnValue(new BehaviorSubject(makeStory()));

    fixture.detectChanges();
    const title = (fixture.nativeElement as HTMLElement).querySelector('.laptop .title');

    expect(title?.getAttribute('target')).toBe('_blank');
    expect(title?.getAttribute('rel')).toBe('noopener');
  });

  it('links to the item itself when the story has no external url', async () => {
    fetchItemContent.mockReturnValue(new BehaviorSubject(makeStory({ url: 'item?id=42', domain: undefined })));

    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.hasUrl()).toBe(false);
    expect(el.querySelector('.laptop .title')?.getAttribute('href')).toBe('/item/42');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('shows the error message when the request fails', async () => {
    fetchItemContent.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance.errorMessage()).toBe('Could not load item comments.');
    expect(el.querySelector('app-error-message')).not.toBeNull();
    expect(el.querySelector('app-loader')).toBeNull();
  });

  it('refetches when the route id changes and drops stale responses', async () => {
    const first = new Subject<Story>();
    const second = new Subject<Story>();
    fetchItemContent.mockReturnValueOnce(first.asObservable()).mockReturnValueOnce(second.asObservable());

    fixture.detectChanges();
    params.next({ id: '43' });
    fixture.detectChanges();

    expect(fetchItemContent).toHaveBeenNthCalledWith(1, 42);
    expect(fetchItemContent).toHaveBeenNthCalledWith(2, 43);
    expect(first.observed).toBe(false);

    first.next(makeStory({ id: 42, title: 'stale' }));
    second.next(makeStory({ id: 43, title: 'fresh' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.item()?.title).toBe('fresh');
  });

  it('renders one comment component per top-level comment', async () => {
    fetchItemContent.mockReturnValue(new BehaviorSubject(makeStory({
      comments_count: 2,
      comments: [
        { id: 1, level: 0, user: 'a', time: 0, time_ago: '', content: '', deleted: false, comments: [] },
        { id: 2, level: 0, user: 'b', time: 0, time_ago: '', content: '', deleted: false, comments: [] }
      ]
    })));

    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('.comment-list app-comment').length).toBe(2);
    expect(el.querySelector('.laptop .subtext')?.textContent).toContain('2 comments');
  });
});
