import { Component, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);

  readonly openLinkInNewTab = this.settingsService.openLinkInNewTab.asReadonly();
  readonly theme = this.settingsService.theme.asReadonly();
  readonly titleFontSize = this.settingsService.titleFontSize.asReadonly();
  readonly listSpacing = this.settingsService.listSpacing.asReadonly();

  closeSettings() {
    this.settingsService.toggleSettings();
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
