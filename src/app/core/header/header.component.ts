import { Component, inject, signal } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [RouterLink, RouterLinkActive, SettingsComponent]
})
export class HeaderComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly viewportScroller = inject(ViewportScroller);

  readonly showSettings = signal(this.settingsService.settings.showSettings);

  toggleSettings() {
    this.settingsService.toggleSettings();
    this.syncShowSettings();
  }

  syncShowSettings() {
    this.showSettings.set(this.settingsService.settings.showSettings);
  }

  scrollTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
