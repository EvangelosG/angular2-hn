import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Location } from '@angular/common';
import { EMPTY, catchError, map, switchMap } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { CommentComponent } from './comment/comment.component';

import { Story } from '../shared/models/story';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.scss',
  imports: [RouterLink, RouterLinkActive, LoaderComponent, ErrorMessageComponent, CommentPipe, CommentComponent]
})
export class ItemDetailsComponent implements OnInit {
  private readonly _hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly _settingsService = inject(SettingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly _location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = signal<Story | null>(null);
  readonly errorMessage = signal('');
  readonly openLinkInNewTab = this._settingsService.openLinkInNewTab.asReadonly();

  readonly hasUrl = computed(() => (this.item()?.url ?? '').startsWith('http'));

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params['id']),
      switchMap(itemID => this._hackerNewsAPIService.fetchItemContent(itemID).pipe(
        catchError(() => {
          this.errorMessage.set('Could not load item comments.');
          return EMPTY;
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(item => this.item.set(item));
    window.scrollTo(0, 0);
  }

  goBack() {
    this._location.back();
  }
}
