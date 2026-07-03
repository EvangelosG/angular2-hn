import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(() => {
        service = new SettingsService();
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should use the same function reference for add and remove event listener', () => {
        const addSpy = spyOn(service.darkColorSchemeMedia, 'addEventListener');
        const removeSpy = spyOn(service.darkColorSchemeMedia, 'removeEventListener');

        service.subscribeToSystemPreferredColorScheme();
        service.unSubscribeToSystemPrefferedColorScheme();

        const addedHandler = addSpy.calls.mostRecent().args[1];
        const removedHandler = removeSpy.calls.mostRecent().args[1];

        expect(addedHandler).toBe(removedHandler);
    });

    it('should remove event listener on destroy', () => {
        const removeSpy = spyOn(service.darkColorSchemeMedia, 'removeEventListener');

        service.ngOnDestroy();

        expect(removeSpy).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
});
