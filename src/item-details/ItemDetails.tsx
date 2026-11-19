import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { useItem } from '../shared/api/queries';
import { ErrorMessage } from '../shared/components/error-message/ErrorMessage';
import { Loader } from '../shared/components/loader/Loader';
import { useSettings } from '../shared/settings/SettingsContext';
import { formatComment } from '../shared/utils/formatComment';
import { hasUrl, sanitizeHtml } from '../shared/utils/sanitize';
import { Comment } from './comment/Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: item, isError } = useItem(Number(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
    const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

    const laptopClass = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) laptopClass.push('item-header');
    if (item?.content) laptopClass.push('head-margin');

    return (
        <div className="app-item-details">
            <div className="main-content">
                {!item && !isError && <Loader />}
                {!item && isError && <ErrorMessage message="Could not load item comments." />}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={() => navigate(-1)}></span>
                                {hasUrl(item.url) ? (
                                    <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                                        {item.title}
                                    </a>
                                ) : (
                                    <Link className="title" to={`/item/${item.id}`}>
                                        {item.title}
                                    </Link>
                                )}
                            </p>
                        </div>
                        <div className={laptopClass.join(' ')}>
                            {hasUrl(item.url) ? (
                                <p>
                                    <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                                        {item.title}
                                    </a>
                                    {item.domain && <span className="domain"> ({item.domain})</span>}
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
                                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                                    </span>
                                )}
                                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                    {item.time_ago}
                                    {item.type !== 'job' && (
                                        <span>
                                            {' | '}
                                            <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {item.type === 'poll' && (
                            <div className="pollResults">
                                {item.poll?.map((pollResult, i) => (
                                    <div key={i} className="pollContent">
                                        <div dangerouslySetInnerHTML={sanitizeHtml(pollResult.content)} />
                                        <div className="subtext">{pollResult.points} points</div>
                                        <div
                                            className="pollBar"
                                            style={{
                                                width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="subject" dangerouslySetInnerHTML={sanitizeHtml(item.content)} />
                        <ul className="comment-list">
                            {item.comments?.map((comment) => (
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
