import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  imports: [LoaderComponent, ErrorMessageComponent]
})
export class UserComponent implements OnInit {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private route = inject(ActivatedRoute);
  private _location = inject(Location);
  private destroyRef = inject(DestroyRef);

  user = signal<User | null>(null);
  errorMessage = signal('');

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map(params => params.get('id') ?? ''),
        switchMap(userID =>
          this._hackerNewsAPIService.fetchUser(userID).pipe(
            map(user => ({ userID, user })),
            catchError(() => of({ userID, user: null as User | null }))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ userID, user }) => {
        if (user) {
          this.user.set(user);
        } else {
          this.errorMessage.set('Could not load user ' + userID + '.');
        }
      });
  }

  goBack() {
    this._location.back();
  }
}
