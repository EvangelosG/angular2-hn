import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { Story } from '../../shared/models/story';
import { ItemComponent } from '../item/item.component';

@Component({
  selector: 'app-feed',
  imports: [RouterLink, RouterLinkActive, SharedComponentsModule, ItemComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  private readonly hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<Story[] | undefined>(undefined);
  readonly feedType = signal<string | undefined>(undefined);
  readonly pageNum = signal(1);
  readonly listStart = signal<number | undefined>(undefined);
  readonly errorMessage = signal('');

  ngOnInit() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.feedType.set(data['feedType']);
      });

    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const pageNum = params['page'] ? +params['page'] : 1;
        this.pageNum.set(pageNum);
        this.hackerNewsAPIService.fetchFeed(this.feedType(), pageNum)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: items => this.items.set(items),
            error: () => this.errorMessage.set('Could not load ' + this.feedType() + ' stories.'),
            complete: () => {
              this.listStart.set(((pageNum - 1) * 30) + 1);
              window.scrollTo(0, 0);
            }
          });
      });
  }
}
