import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hackernews';
import Item from '../components/Item';
import { ErrorMessage, Loader } from '../components/shared';
import type { Story } from '../models/story';
import './feed-page.scss';

export type FeedName = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_TITLES: Record<FeedName, string> = {
  news: 'Top',
  newest: 'New',
  show: 'Show',
  ask: 'Ask',
  jobs: 'Jobs'
};

export interface FeedPageProps {
  feedType?: FeedName;
}

export default function FeedPage({ feedType: feedTypeProp }: FeedPageProps) {
  const params = useParams<{ feedType?: string; page?: string }>();
  const feedType = (feedTypeProp ?? params.feedType ?? 'news') as FeedName;
  const pageNum = params.page ? Number(params.page) : 1;

  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum, controller.signal)
      .then((stories) => {
        setItems(stories);
        window.scrollTo(0, 0);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setErrorMessage(`Could not load ${feedType} stories.`);
      });

    return () => controller.abort();
  }, [feedType, pageNum]);

  useEffect(() => {
    const title = FEED_TITLES[feedType] ?? feedType;
    document.title = pageNum > 1 ? `${title} (page ${pageNum}) | Angular 2 HN` : `${title} | Angular 2 HN`;
  }, [feedType, pageNum]);

  const listStart = (pageNum - 1) * 30 + 1;

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
              through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <div className="item-block">
                  <Item item={item} />
                </div>
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
