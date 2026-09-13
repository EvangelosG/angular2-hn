import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, concat, map, merge, of, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

@Injectable({
  providedIn: 'root'
})
export class HackerNewsAPIService {
  private readonly baseUrl = 'https://node-hnapi.herokuapp.com';

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return this.fetchJson<Story[]>(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  /**
   * Emits the story as soon as it loads. For polls, the story is emitted
   * again each time one of its poll options resolves (mutated in place), so
   * results fill in progressively.
   */
  fetchItemContent(id: number): Observable<Story> {
    return this.fetchJson<Story>(`${this.baseUrl}/item/${id}`).pipe(
      switchMap(story => (story.type === 'poll' ? this.withPollResults(story) : of(story)))
    );
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return this.fetchJson<PollResult>(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return this.fetchJson<User>(`${this.baseUrl}/user/${id}`);
  }

  private withPollResults(story: Story): Observable<Story> {
    story.poll_votes_count = 0;
    // Poll option ids follow the poll id consecutively: story.id + 1 .. story.id + n
    const pollResults = story.poll.map((_, index) =>
      this.fetchPollContent(story.id + index + 1).pipe(
        map(pollResult => {
          story.poll[index] = pollResult;
          story.poll_votes_count += pollResult.points;
          return story;
        }),
        catchError((err: unknown) => {
          console.error(err);
          return EMPTY;
        })
      )
    );
    return concat(of(story), merge(...pollResults));
  }

  private fetchJson<T>(url: string): Observable<T> {
    return fromFetch<T>(url, { selector: res => res.json() });
  }
}
