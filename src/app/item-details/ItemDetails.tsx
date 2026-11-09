import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

import ErrorMessage from '../shared/components/error-message/ErrorMessage';
import Loader from '../shared/components/loader/Loader';
import { useFetch } from '../shared/hooks/useFetch';
import { fetchItemContent } from '../shared/services/hackernews-api';
import { useSettings } from '../shared/settings/settings';
import { formatCommentCount } from '../shared/utils/comment';
import { externalLinkProps, hasExternalUrl } from '../shared/utils/url';
import Comment from './comment/Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams();
    const itemId = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: item, error } = useFetch((signal) => fetchItemContent(itemId, signal), [itemId]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    const linkProps = externalLinkProps(settings.openLinkInNewTab);

    return (
        <div className="app-item-details">
            <div className="main-content">
                {!item && !error && <Loader />}
                {!item && !!error && <ErrorMessage message="Could not load item comments." />}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={() => navigate(-1)}></span>
                                {hasExternalUrl(item) ? (
                                    <a className="title" href={item.url} {...linkProps}>
                                        {item.title}
                                    </a>
                                ) : (
                                    <NavLink className="title" to={`/item/${item.id}`}>
                                        {item.title}
                                    </NavLink>
                                )}
                            </p>
                        </div>
                        <div
                            className={[
                                'laptop',
                                item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
                                item.content ? 'head-margin' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {hasExternalUrl(item) ? (
                                <p>
                                    <a className="title" href={item.url} {...linkProps}>
                                        {item.title}
                                    </a>
                                    {item.domain && <span className="domain"> ({item.domain})</span>}
                                </p>
                            ) : (
                                <p>
                                    <NavLink className="title" to={`/item/${item.id}`}>
                                        {item.title}
                                    </NavLink>
                                </p>
                            )}
                            <div className="subtext">
                                {item.type !== 'job' && (
                                    <span>
                                        {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>{' '}
                                    </span>
                                )}
                                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                    {item.time_ago}
                                    {item.type !== 'job' && (
                                        <span>
                                            {' | '}
                                            <NavLink to={`/item/${item.id}`}>
                                                {formatCommentCount(item.comments_count)}
                                            </NavLink>
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {item.type === 'poll' && item.poll && (
                            <div className="pollResults">
                                {item.poll.map((pollResult, i) => (
                                    <div key={i} className="pollContent">
                                        <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                        <div className="subtext">{pollResult.points} points</div>
                                        <div
                                            className="pollBar"
                                            style={{
                                                width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
                        <ul className="comment-list">
                            {item.comments.map((comment) => (
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
