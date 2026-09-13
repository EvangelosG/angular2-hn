import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ItemComponent } from './item.component';
import { Story } from '../../shared/models/story';
import { SettingsService } from '../../shared/services/settings.service';

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
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides
  };
}

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemComponent],
      providers: [
        provideRouter([]),
        {
          provide: SettingsService,
          useValue: {
            settings: {
              showSettings: false,
              openLinkInNewTab: true,
              theme: 'default',
              titleFontSize: '18',
              listSpacing: '4'
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
  });

  it('renders an external link with settings applied when the story has a url', () => {
    fixture.componentRef.setInput('item', makeStory());
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector<HTMLAnchorElement>('a.title');
    expect(fixture.componentInstance.hasUrl()).toBe(true);
    expect(title.getAttribute('href')).toBe('https://example.com/post');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
    expect(title.style.fontSize).toBe('18px');
    expect(el.querySelector('.domain').textContent).toContain('example.com');
    expect(el.querySelector<HTMLElement>('div').style.marginBottom).toBe('4px');
    expect(el.querySelector('.comment-number').textContent).toContain('3 comments');
  });

  it('links to the item page when the story has no external url', () => {
    fixture.componentRef.setInput('item', makeStory({ url: 'item?id=1', domain: undefined }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector<HTMLAnchorElement>('a.title');
    expect(fixture.componentInstance.hasUrl()).toBe(false);
    expect(title.getAttribute('href')).toBe('/item/1');
    expect(el.querySelector('.domain')).toBeNull();
  });

  it('hides points and comment links for jobs', () => {
    fixture.componentRef.setInput('item', makeStory({ type: 'job' }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.subtext-palm .name')).toBeNull();
    expect(el.querySelector('.comment-number')).toBeNull();
    expect(el.querySelector('.subtext-laptop').textContent).not.toContain('points by');
  });
});
