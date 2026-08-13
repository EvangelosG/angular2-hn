import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';

describe('UserComponent', () => {
  let api: any;
  let route: any;
  let location: any;
  let component: UserComponent;

  beforeEach(() => {
    api = { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of({ id: 'pg', karma: 1 })) };
    route = { params: of({ id: 'pg' }) };
    location = { back: jasmine.createSpy('back') };

    component = new UserComponent(api, route, location);
  });

  it('loads the user for the route id', () => {
    component.ngOnInit();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user.id).toBe('pg');
  });

  it('sets an error message when the user cannot be loaded', () => {
    api.fetchUser.and.returnValue(throwError(new Error('offline')));

    component.ngOnInit();

    expect(component.errorMessage).toBe('Could not load user pg.');
  });

  it('navigates back', () => {
    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
