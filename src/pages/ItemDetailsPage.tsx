import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../api/hackernews';
import Comment from '../components/Comment';
import { ErrorMessage, Loader } from '../components/shared';
import { useSettings } from '../context/SettingsContext';
import type { Story } from '../models/story';
import { formatCommentCount, renderCommentHtml } from '../utils/comment';

import './item-details.scss';

export default function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItem(null);
        setErrorMessage('');
        window.scrollTo(0, 0);

        fetchItemContent(Number(id), controller.signal)
            .then((story) => setItem(story))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage('Could not load item comments.');
            });

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (!item) {
            return;
        }
        const previousTitle = document.title;
        document.title = `${item.title} | Angular 2 HN`;
        return () => {
            document.title = previousTitle;
        };
    }, [item]);

    if (!item) {
        return (
            <div className="main-content item-page">
                {errorMessage === '' ? <Loader /> : <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = typeof item.url === 'string' && item.url.indexOf('http') === 0;
    const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
    const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

    const laptopClasses = ['laptop'];
    if (item.comments_count > 0 || item.type === 'job') {
        laptopClasses.push('item-header');
    }
    if (item.content) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="main-content item-page">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={() => navigate(-1)} />
                        {hasUrl ? (
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
                <div className={laptopClasses.join(' ')}>
                    {hasUrl ? (
                        <p>
                            <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
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
                                    <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {(item.poll ?? []).map((pollResult, index) => (
                            <div className="pollContent" key={index}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: renderCommentHtml(pollResult.content, settings.openLinkInNewTab),
                                    }}
                                />
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                )}
                <p
                    className="subject"
                    dangerouslySetInnerHTML={{ __html: renderCommentHtml(item.content, settings.openLinkInNewTab) }}
                />
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
