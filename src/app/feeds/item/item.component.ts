import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Story } from '../../shared/models/story';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { PipesModule } from '../../shared/pipes/pipes.module';

@Component({
  selector: 'app-feed-item',
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
  imports: [RouterLink, RouterLinkActive, PipesModule]
})
export class ItemComponent {
  private readonly settingsService = inject(SettingsService);

  readonly item = input.required<Story>();
  readonly settings: Settings = this.settingsService.settings;

  readonly hasUrl = computed(() => this.item().url?.startsWith('http') ?? false);
  readonly isJob = computed(() => this.item().type === 'job');
}
