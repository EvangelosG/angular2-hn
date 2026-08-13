import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [SettingsService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('renders the settings popup', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.popup')).toBeTruthy();
  });

  it('delegates the settings changes to the service', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.selectTheme('night');
    component.changeTitleFont('18');
    component.changeSpacing('2');
    component.toggleOpenLinksInNewTab();
    component.closeSettings();

    expect(component.settings.theme).toBe('night');
    expect(component.settings.titleFontSize).toBe('18');
    expect(component.settings.listSpacing).toBe('2');
    expect(component.settings.openLinkInNewTab).toBe(true);
    expect(component.settings.showSettings).toBe(true);
  });
});
