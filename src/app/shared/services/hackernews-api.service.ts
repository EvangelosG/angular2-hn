import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return lazyFetch(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return lazyFetch<Story>(`${this.baseUrl}/item/${id}`).pipe(
      switchMap((story: Story) => {
        if (story.type === 'poll' && story.poll && story.poll.length > 0) {
          const pollRequests = story.poll.map((_, i) =>
            this.fetchPollContent(story.id + i + 1)
          );
          return forkJoin(pollRequests).pipe(
            map(pollResults => {
              story.poll = pollResults;
              story.poll_votes_count = pollResults.reduce((sum, p) => sum + p.points, 0);
              return story;
            })
          );
        }
        return new Observable<Story>(observer => {
          observer.next(story);
          observer.complete();
        });
      })
    );
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return lazyFetch(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return lazyFetch(`${this.baseUrl}/user/${id}`);
  }
}

function lazyFetch<T>(url: string, options?: RequestInit) {
  return new Observable<T>(fetchObserver => {
    const controller = new AbortController();
    fetch(url, { ...options, signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        fetchObserver.next(data);
        fetchObserver.complete();
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          fetchObserver.error(err);
        }
      });
    return () => {
      controller.abort();
    };
  });
}

