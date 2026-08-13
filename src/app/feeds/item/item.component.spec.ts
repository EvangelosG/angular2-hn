import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemComponent],
      providers: [SettingsService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  function createItem(item: Partial<Story>) {
    const fixture = TestBed.createComponent(ItemComponent);
    fixture.componentInstance.item = item as Story;
    fixture.detectChanges();
    return fixture;
  }

  it('links to the external url for link stories', () => {
    const fixture = createItem({
      id: 1,
      title: 'A story',
      url: 'https://example.com/story',
      domain: 'example.com',
      type: 'story'
    } as Partial<Story>);

    expect(fixture.componentInstance.hasUrl).toBe(true);
    expect(fixture.nativeElement.querySelector('a.title').getAttribute('href')).toBe(
      'https://example.com/story'
    );
  });

  it('treats relative urls as internal items', () => {
    const fixture = createItem({ id: 2, title: 'Ask HN', url: 'item?id=2' } as Partial<Story>);

    expect(fixture.componentInstance.hasUrl).toBe(false);
  });

  it('does not throw for items without a url', () => {
    const fixture = createItem({ id: 3, title: 'Ask HN: anything?' } as Partial<Story>);

    expect(fixture.componentInstance.hasUrl).toBe(false);
    expect(fixture.nativeElement.querySelector('a.title').textContent).toContain('Ask HN');
  });
});
