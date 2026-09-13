import { Component, inject, output } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);

  readonly settings: Settings = this.settingsService.settings;

  readonly closed = output<void>();

  closeSettings() {
    this.settingsService.toggleSettings();
    this.closed.emit();
  }

  toggleOpenLinksInNewTab() {
    this.settingsService.toggleOpenLinksInNewTab();
  }

  selectTheme(theme: string) {
    this.settingsService.setTheme(theme);
  }

  changeTitleFont(val: string) {
    this.settingsService.setFont(val);
  }

  changeSpacing(val: string) {
    this.settingsService.setSpacing(val);
  }
}
