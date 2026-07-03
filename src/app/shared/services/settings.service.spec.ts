import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(() => {
        localStorage.clear();
        service = new SettingsService();
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it('should create with default settings', () => {
        expect(service.settings).toBeDefined();
        expect(service.settings.showSettings).toBe(false);
        expect(service.settings.openLinkInNewTab).toBe(false);
        expect(service.settings.titleFontSize).toBe('16');
        expect(service.settings.listSpacing).toBe('0');
    });

    it('should toggle showSettings', () => {
        expect(service.settings.showSettings).toBe(false);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(true);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(false);
    });

    it('should toggle openLinkInNewTab and persist', () => {
        expect(service.settings.openLinkInNewTab).toBe(false);
        service.toggleOpenLinksInNewTab();
        expect(service.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        service.toggleOpenLinksInNewTab();
        expect(service.settings.openLinkInNewTab).toBe(false);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('should set theme and persist', () => {
        service.setTheme('night');
        expect(service.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('should set font size and persist', () => {
        service.setFont('20');
        expect(service.settings.titleFontSize).toBe('20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('should set spacing and persist', () => {
        service.setSpacing('10');
        expect(service.settings.listSpacing).toBe('10');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });

    it('should restore openLinkInNewTab from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const freshService = new SettingsService();
        expect(freshService.settings.openLinkInNewTab).toBe(true);
        freshService.ngOnDestroy();
    });

    it('should restore titleFontSize from localStorage', () => {
        localStorage.setItem('titleFontSize', '24');
        const freshService = new SettingsService();
        expect(freshService.settings.titleFontSize).toBe('24');
        freshService.ngOnDestroy();
    });

    it('should restore listSpacing from localStorage', () => {
        localStorage.setItem('listSpacing', '5');
        const freshService = new SettingsService();
        expect(freshService.settings.listSpacing).toBe('5');
        freshService.ngOnDestroy();
    });

    it('should restore saved theme from localStorage', () => {
        localStorage.setItem('theme', 'amoledblack');
        const freshService = new SettingsService();
        expect(freshService.settings.theme).toBe('amoledblack');
        freshService.ngOnDestroy();
    });
});
