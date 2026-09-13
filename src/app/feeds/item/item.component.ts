import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Story } from '../../shared/models/story';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { CommentPipe } from '../../shared/pipes/comment.pipe';

@Component({
  selector: 'app-item',
  imports: [RouterLink, RouterLinkActive, CommentPipe],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  readonly item = input.required<Story>();
  readonly settings: Settings = inject(SettingsService).settings;

  readonly hasUrl = computed(() => this.item().url.indexOf('http') === 0);
}
