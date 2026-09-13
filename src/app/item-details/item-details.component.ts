import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Location } from '@angular/common';
import { EMPTY, catchError, map, switchMap } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { CommentComponent } from './comment/comment.component';

import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.scss',
  imports: [RouterLink, RouterLinkActive, SharedComponentsModule, PipesModule, CommentComponent]
})
export class ItemDetailsComponent implements OnInit {
  private readonly _hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly _settingsService = inject(SettingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly _location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = signal<Story | null>(null);
  readonly errorMessage = signal('');
  readonly settings: Settings = this._settingsService.settings;

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
