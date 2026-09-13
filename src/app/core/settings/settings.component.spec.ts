import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { installMatchMediaStub } from '../testing/match-media.stub';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: SettingsService;

  beforeAll(() => installMatchMediaStub());

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [SettingsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    settingsService = TestBed.inject(SettingsService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('toggles the service popup state when the close button is clicked', () => {
    const before = settingsService.showSettings();

    fixture.nativeElement.querySelector('.close').click();

    expect(settingsService.showSettings()).toBe(!before);
  });

  it('toggles opening links in a new tab', () => {
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);

    checkbox.click();
    fixture.detectChanges();

    expect(settingsService.openLinkInNewTab()).toBe(true);
    expect(checkbox.checked).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('selects a theme via the radio inputs', () => {
    const night: HTMLInputElement = fixture.nativeElement.querySelector('input[value="night"]');

    night.click();
    fixture.detectChanges();

    expect(settingsService.theme()).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
    expect(night.checked).toBe(true);
  });

  it('updates font size and list spacing on keyup', () => {
    const [fontInput, spacingInput] = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    );

    fontInput.value = '20';
    fontInput.dispatchEvent(new KeyboardEvent('keyup'));
    spacingInput.value = '4';
    spacingInput.dispatchEvent(new KeyboardEvent('keyup'));

    expect(settingsService.titleFontSize()).toBe('20');
    expect(settingsService.listSpacing()).toBe('4');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(localStorage.getItem('listSpacing')).toBe('4');
  });
});
