import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { installMatchMediaStub } from './core/testing/match-media.stub';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeAll(() => installMatchMediaStub());

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the header, router outlet and footer', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-header')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();
    expect(el.querySelector('app-footer')).not.toBeNull();
  });

  it('applies the current theme as the wrapper class', () => {
    const settingsService = TestBed.inject(SettingsService);
    const root: HTMLElement = fixture.nativeElement.firstElementChild;
    expect(root.className).toBe('default');

    settingsService.setTheme('night');
    fixture.detectChanges();
    expect(root.className).toBe('night');
  });
});
