import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackerNews';
import { Story } from '../../types';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Item from './Item';
import './Feed.scss';

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];
const ITEMS_PER_PAGE = 30;

export default function Feed() {
  const { feedType = '', page } = useParams();
  const pageNum = page ? +page : 1;
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!FEED_TYPES.includes(feedType)) {
      return;
    }

    let cancelled = false;
    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then(stories => {
        if (!cancelled) {
          setItems(stories);
          window.scrollTo(0, 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Could not load ' + feedType + ' stories.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [feedType, pageNum]);

  if (!FEED_TYPES.includes(feedType)) {
    return <Navigate to="/news/1" replace />;
  }

  const listStart = (pageNum - 1) * ITEMS_PER_PAGE + 1;

  return (
    <div className="feed-view">
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
              {items.map(item => (
                <li key={item.id} className="post">
                  <Item item={item} />
                </li>
              ))}
            </ol>
            <div className="nav">
              {listStart !== 1 && (
                <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                  &lsaquo; Prev
                </Link>
              )}
              {items.length === ITEMS_PER_PAGE && (
                <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                  More &rsaquo;
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
