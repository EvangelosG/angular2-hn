import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';

import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  let apiServiceStub: any;
  let routeStub: any;

  beforeEach(() => {
    apiServiceStub = {
      fetchFeed: () => of([])
    };
    routeStub = {
      data: new BehaviorSubject({ feedType: 'news' }),
      params: new BehaviorSubject({ page: '1' })
    };
  });

  it('keeps route subscriptions open while active', () => {
    const component = new FeedComponent(apiServiceStub, routeStub);
    component.ngOnInit();

    expect(component.typeSub.closed).toBe(false);
    expect(component.pageSub.closed).toBe(false);
  });

  it('unsubscribes from route subscriptions on destroy (no memory leak)', () => {
    const component = new FeedComponent(apiServiceStub, routeStub);
    component.ngOnInit();

    component.ngOnDestroy();

    expect(component.typeSub.closed).toBe(true);
    expect(component.pageSub.closed).toBe(true);
  });
});
