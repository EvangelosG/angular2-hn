import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;

  constructor(
    private _settingsService: SettingsService,
    private _savedStoriesService: SavedStoriesService
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {}

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  get isSaved(): boolean {
    return this._savedStoriesService.isSaved(this.item.id);
  }

  toggleSaved() {
    this._savedStoriesService.toggle(this.item);
  }
}
