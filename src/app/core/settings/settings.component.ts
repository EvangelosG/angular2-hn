import { Component, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  private readonly _settingsService = inject(SettingsService);

  settings: Settings = this._settingsService.settings;

  closeSettings() {
    this._settingsService.toggleSettings();
  }

  toggleOpenLinksInNewTab() {
    this._settingsService.toggleOpenLinksInNewTab();
  }

  selectTheme(theme: string) {
    this._settingsService.setTheme(theme);
  }

  changeTitleFont(val: string) {
    this._settingsService.setFont(val);
  }

  changeSpacing(val: string) {
    this._settingsService.setSpacing(val);
  }
}
