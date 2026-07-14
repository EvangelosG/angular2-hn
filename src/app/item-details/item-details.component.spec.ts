import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';

describe('ItemDetailsComponent', () => {
  let apiServiceStub: any;
  let settingsServiceStub: any;
  let routeStub: any;
  let locationStub: any;

  beforeEach(() => {
    apiServiceStub = {
      fetchItemContent: () => of({})
    };
    settingsServiceStub = {
      settings: {}
    };
    routeStub = {
      params: new BehaviorSubject({ id: '1' })
    };
    locationStub = {
      back: () => {}
    };
  });

  it('unsubscribes from the route subscription on destroy (no memory leak)', () => {
    const component = new ItemDetailsComponent(
      apiServiceStub,
      settingsServiceStub,
      routeStub,
      locationStub
    );
    component.ngOnInit();

    expect(component.sub.closed).toBe(false);

    component.ngOnDestroy();

    expect(component.sub.closed).toBe(true);
  });
});
