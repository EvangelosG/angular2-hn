import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import fetch from 'unfetch';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

type FetchOptions = Parameters<typeof fetch>[1];

// wrap fetch in observable so we can keep it chill
@Injectable({
  providedIn: 'root'
})
export class HackerNewsAPIService {
  readonly baseUrl = 'https://node-hnapi.herokuapp.com';

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return lazyFetch<Story[]>(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return lazyFetch<Story>(`${this.baseUrl}/item/${id}`).pipe(map((story: Story) => {
      if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
          this.fetchPollContent(story.id + i).subscribe(pollResults => {
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
          });
        }
      }
      return story;
    }));
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return lazyFetch<PollResult>(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return lazyFetch<User>(`${this.baseUrl}/user/${id}`);
  }
}

function lazyFetch<T>(url: string, options?: FetchOptions): Observable<T> {
  return new Observable<T>(fetchObserver => {
    let cancelToken = false;
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then((data: T) => {
              fetchObserver.next(data);
              fetchObserver.complete();
            });
        }
      }).catch(err => fetchObserver.error(err));
    return () => {
      cancelToken = true;
    };
  });
}
