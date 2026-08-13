import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let requestedUrls: string[];

  function stubResponses(responses: { [url: string]: any }) {
    service.fetchImpl = (url: string) => {
      requestedUrls.push(url);
      return Promise.resolve({ json: () => Promise.resolve(responses[url]) });
    };
  }

  beforeEach(() => {
    service = new HackerNewsAPIService();
    requestedUrls = [];
  });

  it('builds the feed url from the feed type and page', done => {
    stubResponses({ [`${baseUrl}/news?page=2`]: [{ id: 1 }] });

    service.fetchFeed('news', 2).subscribe(items => {
      expect(requestedUrls).toEqual([`${baseUrl}/news?page=2`]);
      expect(items).toEqual([{ id: 1 }] as any);
      done();
    });
  });

  it('emits the parsed json and completes', done => {
    stubResponses({ [`${baseUrl}/user/pg`]: { id: 'pg', karma: 155000 } });
    const emitted: any[] = [];

    service.fetchUser('pg').subscribe(
      user => emitted.push(user),
      () => fail('should not error'),
      () => {
        expect(emitted).toEqual([{ id: 'pg', karma: 155000 }]);
        done();
      }
    );
  });

  it('builds the item url', done => {
    stubResponses({ [`${baseUrl}/item/8863`]: { id: 8863, type: 'link' } });

    service.fetchItemContent(8863).subscribe(item => {
      expect(requestedUrls).toEqual([`${baseUrl}/item/8863`]);
      expect(item.id).toBe(8863);
      done();
    });
  });

  it('builds the poll content url', done => {
    stubResponses({ [`${baseUrl}/item/12`]: { points: 3, content: 'option' } });

    service.fetchPollContent(12).subscribe(pollResult => {
      expect(requestedUrls).toEqual([`${baseUrl}/item/12`]);
      expect(pollResult.points).toBe(3);
      done();
    });
  });

  it('propagates fetch rejections through the error channel', done => {
    const failure = new Error('offline');
    service.fetchImpl = () => Promise.reject(failure);

    service.fetchFeed('news', 1).subscribe(
      () => fail('should not emit'),
      error => {
        expect(error).toBe(failure);
        done();
      }
    );
  });

  it('does not emit once the subscription has been cancelled', done => {
    let resolveFetch: (value: any) => void;
    service.fetchImpl = () =>
      new Promise(resolve => {
        resolveFetch = resolve;
      });

    let emissions = 0;
    const subscription = service.fetchFeed('news', 1).subscribe(() => emissions++);
    subscription.unsubscribe();
    resolveFetch({ json: () => Promise.resolve([{ id: 1 }]) });

    setTimeout(() => {
      expect(emissions).toBe(0);
      done();
    }, 0);
  });

  it('aggregates poll options and their total vote count', done => {
    stubResponses({
      [`${baseUrl}/item/100`]: {
        id: 100,
        type: 'poll',
        poll: [{}, {}]
      },
      [`${baseUrl}/item/101`]: { points: 5, content: 'first' },
      [`${baseUrl}/item/102`]: { points: 7, content: 'second' }
    });

    service.fetchItemContent(100).subscribe(story => {
      setTimeout(() => {
        expect(story.poll).toEqual([
          { points: 5, content: 'first' },
          { points: 7, content: 'second' }
        ] as any);
        expect(story.poll_votes_count).toBe(12);
        done();
      }, 0);
    });
  });
});
