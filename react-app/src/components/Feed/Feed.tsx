import { useCallback, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/ErrorMessage/ErrorMessage';
import { Item } from '../Item/Item';
import { Loader } from '../shared/Loader/Loader';
import { fetchFeed } from '../../api/hackernews';
import { useHackerNews } from '../../hooks/useHackerNews';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

export function Feed({ feedType }: FeedProps) {
  const { page } = useParams();
  const pageNum = page ? Number(page) : 1;

  const request = useCallback(
    (signal: AbortSignal) => fetchFeed(feedType, pageNum, signal),
    [feedType, pageNum]
  );
  const { data: items, errorMessage } = useHackerNews(request, `Could not load ${feedType} stories.`);

  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    if (items) {
      window.scrollTo(0, 0);
    }
  }, [items]);

  return (
    <div className="main-content feed">
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
                <Item item={item} />
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
