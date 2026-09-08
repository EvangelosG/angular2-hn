import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Loader from '@/components/Loader/Loader';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import Comment from '@/components/Comment/Comment';

import { fetchItemContent } from '@/services/hackerNewsApi';
import { useSettings } from '@/context/SettingsContext';
import { formatCommentCount } from '@/utils/comment';

import type { Story } from '@/models/story';

import styles from './ItemDetails.module.scss';

/**
 * The Angular `Story` model has no `content` field, but the original template
 * renders `item.content` (the HTML body the API returns for Ask HN / job posts).
 */
type StoryWithContent = Story & { content?: string };

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<StoryWithContent | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const itemID = Number(id);

    setItem(null);
    setErrorMessage('');

    fetchItemContent(itemID)
      .then(fetchedItem => {
        if (!cancelled) {
          setItem(fetchedItem);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Could not load item comments.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  const hasUrl = !!item && typeof item.url === 'string' && item.url.indexOf('http') === 0;

  const laptopClassNames = [styles.laptop];
  if (item && (item.comments_count > 0 || item.type === 'job')) {
    laptopClassNames.push('item-header');
  }
  if (item && item.content) {
    laptopClassNames.push(styles['head-margin']);
  }

  return (
    <div className={styles['main-content']}>
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className={styles.item}>
          <div className={`${styles.mobile} item-header`}>
            <p className={styles['title-block']}>
              <span className="back-button" onClick={goBack}></span>
              {hasUrl ? (
                <a
                  className={styles.title}
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : undefined}
                  rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                >
                  {item.title}
                </a>
              ) : (
                <Link className={styles.title} to={`/item/${item.id}`}>
                  {item.title}
                </Link>
              )}
            </p>
          </div>

          <div className={laptopClassNames.join(' ')}>
            {hasUrl ? (
              <p>
                <a
                  className={styles.title}
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : undefined}
                  rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                >
                  {item.title}
                </a>
                {item.domain && <span className="domain">({item.domain})</span>}
              </p>
            ) : (
              <p>
                <Link className={styles.title} to={`/item/${item.id}`}>
                  {item.title}
                </Link>
              </p>
            )}
            <div className="subtext">
              {item.type !== 'job' && (
                <span>
                  {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span className={item.type !== 'job' ? styles['item-details'] : undefined}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    |<Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>

          {item.type === 'poll' && (
            <div className={styles.pollResults}>
              {(item.poll ?? []).map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          )}

          <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />

          <ul className="comment-list">
            {(item.comments ?? []).map(comment => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
