import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackerNewsApi';
import { useFetch } from '../../api/useFetch';
import { useSettings } from '../../context/useSettings';
import { formatComments } from '../../utils/formatComments';
import Comment from '../Comment/Comment';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Loader from '../Loader/Loader';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const itemID = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();

    const { data: item, error } = useFetch(
        (signal) => fetchItemContent(itemID, signal),
        'Could not load item comments.',
        [itemID]
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemID]);

    const hasUrl = item && item.url ? item.url.indexOf('http') === 0 : false;
    const newTabProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    const titleLink = item ? (
        hasUrl ? (
            <a className="title" href={item.url} {...newTabProps}>
                {item.title}
            </a>
        ) : (
            <Link className="title" to={`/item/${item.id}`}>
                {item.title}
            </Link>
        )
    ) : null;

    return (
        <div className="main-content">
            {!item && !error && <Loader />}
            {!item && error !== '' && <ErrorMessage message={error} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {titleLink}
                        </p>
                    </div>
                    <div
                        className={[
                            'laptop',
                            item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
                            item.text ? 'head-margin' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <p>
                            {titleLink}
                            {hasUrl && item.domain && <span className="domain">({item.domain})</span>}
                        </p>
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
                                        <Link to={`/item/${item.id}`}>{formatComments(item.comments_count)}</Link>
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
    );
}
