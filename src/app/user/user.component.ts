import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-user',
  imports: [SharedComponentsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  private readonly hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<User | undefined>(undefined);
  readonly errorMessage = signal('');

  ngOnInit() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const userID: string = params['id'];
        this.hackerNewsAPIService
          .fetchUser(userID)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: data => this.user.set(data),
            error: () => this.errorMessage.set('Could not load user ' + userID + '.')
          });
      });
  }

  goBack() {
    this.location.back();
  }
}
