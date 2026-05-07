import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import { fetchItemContent } from '../../hooks/useHackerNewsApi';
import type { Story } from '../../models';
import { formatCommentCount } from '../../utils/commentFormatter';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Comment from './Comment';

function hasExternalUrl(url: string | undefined): boolean {
    return typeof url === 'string' && url.indexOf('http') === 0;
}

function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const [item, setItem] = useState<Story | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setErrorMessage('Could not load item comments.');
            return;
        }
        let ignored = false;
        setLoading(true);
        setItem(null);
        setErrorMessage(null);

        fetchItemContent(id)
            .then((data) => {
                if (ignored) return;
                setItem(data);
            })
            .catch(() => {
                if (ignored) return;
                setErrorMessage('Could not load item comments.');
            })
            .finally(() => {
                if (ignored) return;
                setLoading(false);
                window.scrollTo(0, 0);
            });

        return () => {
            ignored = true;
        };
    }, [id]);

    const goBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="main-content">
                <Loader />
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="main-content">
                <ErrorMessage message={errorMessage} />
            </div>
        );
    }

    if (!item) {
        return <div className="main-content" />;
    }

    const externalUrl = hasExternalUrl(item.url);
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener noreferrer' : undefined;
    const laptopHeaderClasses = ['laptop'];
    if ((item.comments_count ?? 0) > 0 || item.type === 'job') {
        laptopHeaderClasses.push('item-header');
    }
    const commentLabel = formatCommentCount(item.comments_count);
    const pollVotes = item.poll_votes_count ?? 0;

    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <button
                            type="button"
                            className="back-button"
                            onClick={goBack}
                            aria-label="Go back"
                        />
                        {externalUrl ? (
                            <a className="title" href={item.url} target={target} rel={rel}>
                                {item.title}
                            </a>
                        ) : (
                            <Link className="title" to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        )}
                    </p>
                </div>
                <div className={laptopHeaderClasses.join(' ')}>
                    {externalUrl ? (
                        <p>
                            <a className="title" href={item.url} target={target} rel={rel}>
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
                                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={item.type !== 'job' ? 'item-details' : undefined}>
                            {item.time_ago}
                            {item.type !== 'job' && (
                                <span>
                                    {' | '}
                                    <Link to={`/item/${item.id}`}>{commentLabel}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && item.poll && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, index) => {
                            const widthPercent = pollVotes > 0 ? (pollResult.points / pollVotes) * 100 : 0;
                            return (
                                <div key={index} className="pollContent">
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div className="pollBar" style={{ width: `${widthPercent}%` }} />
                                </div>
                            );
                        })}
                    </div>
                )}
                {item.content && (
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
                )}
                <ul className="comment-list">
                    {(item.comments ?? []).map((comment) => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ItemDetails;
