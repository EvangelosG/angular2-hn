import { Component } from '@angular/core';

import { Story } from '../../shared/models/story';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent {
  constructor(private _savedStoriesService: SavedStoriesService) {}

  get stories(): Story[] {
    return this._savedStoriesService.getAll();
  }
}
