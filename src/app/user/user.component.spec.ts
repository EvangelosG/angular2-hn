import { BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';

import { UserComponent } from './user.component';

describe('UserComponent', () => {
  let apiServiceStub: any;
  let routeStub: any;
  let locationStub: any;

  beforeEach(() => {
    apiServiceStub = {
      fetchUser: () => of({})
    };
    routeStub = {
      params: new BehaviorSubject({ id: 'someone' })
    };
    locationStub = {
      back: () => {}
    };
  });

  it('unsubscribes from the route subscription on destroy (no memory leak)', () => {
    const component = new UserComponent(apiServiceStub, routeStub, locationStub);
    component.ngOnInit();

    expect(component.sub.closed).toBe(false);

    component.ngOnDestroy();

    expect(component.sub.closed).toBe(true);
  });
});
