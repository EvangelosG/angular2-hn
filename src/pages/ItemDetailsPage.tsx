import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Comment } from '../components/Comment';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useSettings } from '../hooks/useSettings';
import { fetchItemContent } from '../services/hackernews-api';
import { formatComment } from '../utils/formatComment';
import type { Story } from '../models/story';
import './ItemDetailsPage.scss';

export function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setItem(null);
        setErrorMessage('');

        const itemId = parseInt(id, 10);
        fetchItemContent(itemId)
            .then((data) => {
                if (cancelled) return;
                setItem(data);
            })
            .catch(() => {
                if (cancelled) return;
                setErrorMessage('Could not load item comments.');
            });

        window.scrollTo(0, 0);
        return () => {
            cancelled = true;
        };
    }, [id]);

    const goBack = () => {
        navigate(-1);
    };

    const hasUrl = !!item?.url && item.url.indexOf('http') === 0;
    const targetProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div className="item-details-page main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack} />
                            {hasUrl ? (
                                <a className="title" href={item.url} {...targetProps}>
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
                        className={`laptop${
                            item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''
                        }${item.content ? ' head-margin' : ''}`}
                    >
                        {hasUrl ? (
                            <p>
                                <a className="title" href={item.url} {...targetProps}>
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
                                    {item.points} points by{' '}
                                    <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : ''}>
                                {' '}
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
                    {item.type === 'poll' && Array.isArray(item.poll) && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, idx) => (
                                <div key={idx} className="pollContent">
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: item.poll_votes_count
                                                ? `${(pollResult.points / item.poll_votes_count) * 100}%`
                                                : '0%',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {item.content && (
                        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
                    )}
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
    );
}
