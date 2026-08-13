import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    (window as any).ga = () => {};

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [SettingsService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('renders with the current theme applied', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.settings).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.wrapper')).toBeTruthy();
  });
});
