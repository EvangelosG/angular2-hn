import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../api/hnApi';
import { useSettings } from '../context/SettingsContext';
import { Story } from '../models/story';
import { commentLabel } from '../utils/commentLabel';
import Comment from './Comment';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<'id'>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        window.scrollTo(0, 0);
        fetchItemContent(Number(id)).then(
            story => {
                if (!cancelled) {
                    setItem(story);
                }
            },
            () => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [id]);

    const hasUrl = item ? (item.url || '').indexOf('http') === 0 : false;
    const isStory = item ? item.type !== 'job' : false;
    const externalLinkProps = {
        target: settings.openLinkInNewTab ? '_blank' : undefined,
        rel: settings.openLinkInNewTab ? 'noopener noreferrer' : undefined,
    };

    const laptopClasses = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClasses.push('item-header');
    }
    if (item && item.text) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {hasUrl ? (
                                <a className="title" href={item.url} {...externalLinkProps}>
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
                                <a className="title" href={item.url} {...externalLinkProps}>
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
                            {isStory && (
                                <span>
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={isStory ? 'item-details' : undefined}>
                                {item.time_ago}
                                {isStory && (
                                    <span>
                                        {' '}
                                        | <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, index) => (
                                <div key={index} className="pollContent">
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content || '' }}></p>
                    <ul className="comment-list">
                        {(item.comments || []).map(comment => (
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
