import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ItemComponent } from './item.component';
import { Story } from '../../shared/models/story';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

const settings: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '0',
};

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A story',
    points: 42,
    user: 'pg',
    time: 0,
    time_ago: 0,
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    text: '',
    content: '',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  };
}

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemComponent],
      providers: [provideRouter([]), { provide: SettingsService, useValue: { settings } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
  });

  it('renders an external link with domain when the story has an http url', async () => {
    fixture.componentRef.setInput('item', makeStory());
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector<HTMLAnchorElement>('a.title');
    expect(title?.getAttribute('href')).toBe('https://example.com/post');
    expect(title?.textContent?.trim()).toBe('A story');
    expect(el.querySelector('.domain')?.textContent).toBe('(example.com)');
    expect(el.textContent).toContain('3 comments');
  });

  it('links internally when the story url is not http', async () => {
    fixture.componentRef.setInput('item', makeStory({ url: 'item?id=1', domain: undefined }));
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('a.title')?.getAttribute('href')).toBe('/item/1');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('hides points and comments for job items', async () => {
    fixture.componentRef.setInput('item', makeStory({ type: 'job' }));
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.comment-number')).toBeNull();
    expect(el.textContent).not.toContain('points by');
  });

  it('does not throw when url is missing', async () => {
    fixture.componentRef.setInput('item', makeStory({ url: undefined }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.hasUrl()).toBe(false);
  });
});
