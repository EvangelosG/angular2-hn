import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { BookmarksService } from '../../shared/services/bookmarks.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit, OnDestroy {
  bookmarks: Story[] = [];
  private sub: Subscription;

  constructor(private _bookmarksService: BookmarksService) {}

  ngOnInit() {
    this.sub = this._bookmarksService.bookmarks$.subscribe(bookmarks => {
      this.bookmarks = bookmarks;
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
