import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [SettingsService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('renders the navigation', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.header-nav')).toBeTruthy();
  });

  it('toggles the settings panel', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.settings.showSettings).toBe(false);

    component.toggleSettings();
    expect(component.settings.showSettings).toBe(true);
  });

  it('scrolls back to the top', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    spyOn(window, 'scrollTo');

    fixture.componentInstance.scrollTop();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
