import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let api: any;
  let settingsService: any;
  let route: any;
  let location: any;
  let component: ItemDetailsComponent;

  beforeEach(() => {
    api = { fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of({ id: 5 })) };
    settingsService = { settings: { showSettings: false } };
    route = { params: of({ id: '5' }) };
    location = { back: jasmine.createSpy('back') };

    component = new ItemDetailsComponent(api, settingsService, route, location);
  });

  it('loads the item for the route id', () => {
    component.ngOnInit();

    expect(api.fetchItemContent).toHaveBeenCalledWith(5);
    expect(component.item.id).toBe(5);
  });

  it('sets an error message when the item cannot be loaded', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('offline')));

    component.ngOnInit();

    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('navigates back', () => {
    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });

  it('reports hasUrl only for absolute urls and never throws without one', () => {
    component.item = { url: 'https://example.com' } as Story;
    expect(component.hasUrl).toBe(true);

    component.item = { url: 'item?id=5' } as Story;
    expect(component.hasUrl).toBe(false);

    component.item = {} as Story;
    expect(component.hasUrl).toBe(false);
  });
});
