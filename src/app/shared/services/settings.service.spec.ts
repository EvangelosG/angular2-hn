import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let addSpy: jasmine.Spy;
  let removeSpy: jasmine.Spy;

  beforeEach(() => {
    addSpy = jasmine.createSpy('addEventListener');
    removeSpy = jasmine.createSpy('removeEventListener');
    const mediaStub: any = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: addSpy,
      removeEventListener: removeSpy,
      dispatchEvent: () => true
    };
    spyOn(window, 'matchMedia').and.returnValue(mediaStub);
  });

  it('registers exactly one color-scheme change listener on construction', () => {
    const service = new SettingsService();

    expect(service).toBeTruthy();
    expect(addSpy).toHaveBeenCalledTimes(1);
  });

  it('removes the exact same listener reference it registered (no leaked listener)', () => {
    const service = new SettingsService();
    const addedHandler = addSpy.calls.mostRecent().args[1];

    service.unSubscribeToSystemPrefferedColorScheme();

    expect(removeSpy).toHaveBeenCalledTimes(1);
    const removedHandler = removeSpy.calls.mostRecent().args[1];
    expect(removedHandler).toBe(addedHandler);
  });
});
