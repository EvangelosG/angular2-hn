import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let ga: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    ga = vi.fn();
    (window as unknown as { ga: typeof ga }).ga = ga;

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        {
          provide: SettingsService,
          useValue: {
            settings: { showSettings: false, openLinkInNewTab: false, theme: 'night', titleFontSize: '16', listSpacing: '0' }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
  });

  it('renders the shell with header, outlet and footer under the theme class', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.night')).not.toBeNull();
    expect(el.querySelector('app-header')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();
    expect(el.querySelector('app-footer')).not.toBeNull();
  });

  it('reports a pageview to analytics after each navigation', async () => {
    fixture.detectChanges();
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/newest/1');

    expect(ga).toHaveBeenCalledWith('set', 'page', '/newest/1');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  });
});
