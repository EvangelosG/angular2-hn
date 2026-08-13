import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

class ActivatedRouteStub {
  data: Observable<any> = of({ feedType: 'news' });
  params: Observable<any> = of({ page: '3' });
}

class ApiStub {
  response: Observable<Story[]> = of([{ id: 1 } as Story]);
  requests: Array<{ feedType: string; page: number }> = [];

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    this.requests.push({ feedType, page });
    return this.response;
  }
}

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let api: ApiStub;
  let route: ActivatedRouteStub;

  beforeEach(async(() => {
    api = new ApiStub();
    route = new ActivatedRouteStub();

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: route }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('loads the feed for the route feed type and page', () => {
    fixture.detectChanges();

    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(3);
    expect(api.requests).toEqual([{ feedType: 'news', page: 3 }]);
    expect(component.items.length).toBe(1);
  });

  it('computes the list start offset from the page number', () => {
    fixture.detectChanges();

    expect(component.listStart).toBe(61);
  });

  it('defaults to page one when the route has no page param', () => {
    route.params = of({});

    fixture.detectChanges();

    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('sets an error message when the feed cannot be loaded', () => {
    api.response = throwError(new Error('offline'));

    fixture.detectChanges();

    expect(component.items).toBeUndefined();
    expect(component.errorMessage).toBe('Could not load news stories.');
  });
});
