import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Location } from '@angular/common';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { CommentComponent } from './comment/comment.component';

import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-item-details',
  imports: [RouterLink, RouterLinkActive, SharedComponentsModule, PipesModule, CommentComponent],
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent implements OnInit {
  private readonly _hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly _settingsService = inject(SettingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly _location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = signal<Story | undefined>(undefined);
  readonly errorMessage = signal('');
  readonly hasUrl = computed(() => {
    const item = this.item();
    return !!item && item.url.indexOf('http') === 0;
  });
  settings: Settings = this._settingsService.settings;

  ngOnInit() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const itemID = +params['id'];
        this._hackerNewsAPIService.fetchItemContent(itemID).subscribe({
          next: item => this.item.set(item),
          error: () => this.errorMessage.set('Could not load item comments.')
        });
      });
    window.scrollTo(0, 0);
  }

  goBack() {
    this._location.back();
  }
}
