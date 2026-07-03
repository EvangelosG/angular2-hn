import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Story } from '../../types';
import { fetchFeed } from '../../services/hackernews-api';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Item } from './Item';
import './Feed.scss';

const VALID_FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export function Feed() {
  const { feedType = 'news', page = '1' } = useParams<{ feedType: string; page: string }>();
  const [items, setItems] = useState<Story[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const pageNum = parseInt(page, 10) || 1;
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    if (!VALID_FEED_TYPES.includes(feedType)) return;

    setItems(null);
    setErrorMessage('');

    fetchFeed(feedType, pageNum)
      .then(data => {
        setItems(data);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        setErrorMessage(`Could not load ${feedType} stories.`);
      });
  }, [feedType, pageNum]);

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : ''} start={listStart}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                &#8249; Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                More &#8250;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
