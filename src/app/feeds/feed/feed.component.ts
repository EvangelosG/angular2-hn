import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, combineLatest, map, of, switchMap, tap } from 'rxjs';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { ItemComponent } from '../item/item.component';

type FeedResult =
  | { status: 'success'; items: Story[] }
  | { status: 'error' };

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
  imports: [RouterLink, RouterLinkActive, LoaderComponent, ErrorMessageComponent, ItemComponent]
})
export class FeedComponent implements OnInit {
  private readonly hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<Story[] | undefined>(undefined);
  readonly feedType = signal('');
  readonly pageNum = signal(1);
  readonly listStart = signal(1);
  readonly errorMessage = signal('');

  ngOnInit() {
    combineLatest([this.route.data, this.route.params])
      .pipe(
        tap(([data, params]) => {
          this.feedType.set(data['feedType'] as string);
          this.pageNum.set(params['page'] ? +params['page'] : 1);
        }),
        switchMap(() =>
          this.hackerNewsAPIService.fetchFeed(this.feedType(), this.pageNum()).pipe(
            map((items): FeedResult => ({ status: 'success', items })),
            catchError(() => of<FeedResult>({ status: 'error' }))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        if (result.status === 'error') {
          this.errorMessage.set('Could not load ' + this.feedType() + ' stories.');
          return;
        }
        this.items.set(result.items);
        this.listStart.set(((this.pageNum() - 1) * 30) + 1);
        window.scrollTo(0, 0);
      });
  }
}
