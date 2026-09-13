import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { installMatchMediaStub } from '../testing/match-media.stub';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let settingsService: SettingsService;

  beforeAll(() => installMatchMediaStub());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    settingsService = TestBed.inject(SettingsService);
    fixture.detectChanges();
  });

  afterEach(() => {
    settingsService.showSettings.set(false);
  });

  it('renders the navigation links', () => {
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a[href]');
    const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/news/1', '/newest/1', '/show/1', '/ask/1', '/jobs/1']);
  });

  it('does not show the settings popup initially', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();
  });

  it('toggles the settings popup via the service', () => {
    const cog: HTMLElement = fixture.nativeElement.querySelector('img.settings');

    cog.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.showSettings()).toBe(true);
    expect(settingsService.showSettings()).toBe(true);
    expect(fixture.nativeElement.querySelector('app-settings')).not.toBeNull();

    cog.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.showSettings()).toBe(false);
    expect(settingsService.showSettings()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();
  });

  it('hides the popup when the settings component closes itself', () => {
    fixture.componentInstance.toggleSettings();
    fixture.detectChanges();

    const close: HTMLElement = fixture.nativeElement.querySelector('app-settings .close');
    close.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.showSettings()).toBe(false);
    expect(settingsService.showSettings()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();
  });
});
