import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { SettingsService } from './shared/services/settings.service';

declare let ga: ((...args: unknown[]) => void) | undefined;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, HeaderComponent, FooterComponent]
})
export class AppComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  readonly theme = this.settingsService.theme;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(event => {
        if (typeof ga === 'function') {
          ga('set', 'page', event.urlAfterRedirects);
          ga('send', 'pageview');
        }
      });
  }
}
