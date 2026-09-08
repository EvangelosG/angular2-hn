import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import Item from '@/components/Item/Item';
import Loader from '@/components/Loader/Loader';
import { fetchFeed } from '@/services/hackerNewsApi';
import type { Story } from '@/models/story';

import styles from './Feed.module.scss';

export interface FeedProps {
  /** Feed type ('news' | 'newest' | 'show' | 'ask' | 'jobs'). Falls back to the route. */
  feedType?: string;
}

export default function Feed({ feedType: feedTypeProp }: FeedProps) {
  const params = useParams<{ feedType?: string; page?: string }>();
  const location = useLocation();

  const feedType =
    feedTypeProp ?? params.feedType ?? location.pathname.split('/').filter(Boolean)[0] ?? 'news';
  const pageNum = params.page ? +params.page : 1;

  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [listStart, setListStart] = useState(1);

  useEffect(() => {
    let cancelled = false;

    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum).then(
      (fetchedItems) => {
        if (cancelled) {
          return;
        }
        setItems(fetchedItems);
        setListStart((pageNum - 1) * 30 + 1);
        window.scrollTo(0, 0);
      },
      () => {
        if (cancelled) {
          return;
        }
        setErrorMessage('Could not load ' + feedType + ' stories.');
      }
    );

    return () => {
      cancelled = true;
    };
  }, [feedType, pageNum]);

  return (
    <div className={styles['main-content']}>
      {!items && errorMessage === '' && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at
              a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {feedType !== 'new' && (
            <ol
              className={feedType !== 'jobs' ? styles['list-margin'] : undefined}
              start={listStart}
            >
              {items.map((item) => (
                <li key={item.id} className={styles.post}>
                  <div className={styles['item-block']}>
                    <Item item={item} />
                  </div>
                </li>
              ))}
            </ol>
          )}
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
