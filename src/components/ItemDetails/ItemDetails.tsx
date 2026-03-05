import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Story } from '../../types/Story';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCommentCount } from '../../utils/commentText';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import Comment from '../Comment/Comment';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './ItemDetails.scss';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setItem(null);
    setErrorMessage('');

    if (id) {
      fetchItemContent(parseInt(id, 10))
        .then(data => {
          if (!cancelled) setItem(data);
        })
        .catch(() => {
          if (!cancelled) setErrorMessage('Could not load item comments.');
        });
    }
    window.scrollTo(0, 0);

    return () => {
      cancelled = true;
    };
  }, [id]);

  const goBack = () => navigate(-1);
  const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

  return (
    <div className="item-details-wrapper">
      <div className="main-content">
        {!item && !errorMessage && <Loader />}
        {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

        {item && (
          <div className="item">
            <div className="mobile item-header">
              <p className="title-block">
                <span className="back-button" onClick={goBack}></span>
                {hasUrl ? (
                  <a
                    className="title"
                    href={item.url}
                    target={settings.openLinkInNewTab ? '_blank' : undefined}
                    rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                  >
                    {item.title}
                  </a>
                ) : (
                  <Link className="title" to={`/item/${item.id}`}>
                    {item.title}
                  </Link>
                )}
              </p>
            </div>
            <div
              className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
            >
              {hasUrl ? (
                <p>
                  <a
                    className="title"
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
                  <Link className="title" to={`/item/${item.id}`}>
                    {item.title}
                  </Link>
                </p>
              )}
              <div className="subtext">
                {item.type !== 'job' && (
                  <span>
                    {item.points} points by{' '}
                    <Link to={`/user/${item.user}`}>{item.user}</Link>
                  </span>
                )}
                <span className={item.type !== 'job' ? 'item-details-spacing' : undefined}>
                  {item.time_ago}
                  {item.type !== 'job' && (
                    <span>
                      {' '}|{' '}
                      <Link to={`/item/${item.id}`}>
                        {formatCommentCount(item.comments_count)}
                      </Link>
                    </span>
                  )}
                </span>
              </div>
            </div>
            {item.type === 'poll' && item.poll && (
              <div className="pollResults">
                {item.poll.map((pollResult, index) => (
                  <div key={index} className="pollContent">
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content || '') }} />
                    <div className="subtext">{pollResult.points} points</div>
                    <div
                      className="pollBar"
                      style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
            {item.content && (
              <p
                className="subject"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
              />
            )}
            <ul className="comment-list">
              {item.comments &&
                item.comments.map(comment => (
                  <li key={comment.id}>
                    <Comment comment={comment} />
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
