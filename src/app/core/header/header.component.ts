import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { BookmarksService } from '../../shared/services/bookmarks.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  settings: Settings;
  bookmarks$: Observable<Story[]>;

  constructor(
    private _settingsService: SettingsService,
    private _bookmarksService: BookmarksService
  ) {
    this.settings = this._settingsService.settings;
    this.bookmarks$ = this._bookmarksService.bookmarks$;
  }

  ngOnInit() {
  }

  toggleSettings() {
    this._settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
