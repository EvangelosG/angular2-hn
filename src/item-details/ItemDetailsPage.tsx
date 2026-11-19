import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useItem } from '../shared/api/queries';
import type { Story } from '../shared/models/story';
import { useSettings } from '../shared/settings/SettingsContext';
import Loader from '../shared/components/Loader';
import ErrorMessage from '../shared/components/ErrorMessage';
import { formatCommentCount } from '../shared/utils/formatCommentCount';
import { hasExternalUrl } from '../shared/utils/hasExternalUrl';
import { sanitizeHtml } from '../shared/utils/sanitizeHtml';
import Comment from './Comment';
import './ItemDetailsPage.scss';

export default function ItemDetailsPage() {
    const params = useParams<{ id: string }>();
    const itemId = Number(params.id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: item, isError } = useItem(itemId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    const newTabProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    const isJob = item?.type === 'job';

    const titleLink = (story: Story) =>
        hasExternalUrl(story) ? (
            <a className="title" href={story.url} {...newTabProps}>
                {story.title}
            </a>
        ) : (
            <Link className="title" to={`/item/${story.id}`}>
                {story.title}
            </Link>
        );

    return (
        <div className="main-content item-details-page">
            {!item && !isError && <Loader />}
            {!item && isError && <ErrorMessage message="Could not load item comments." />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {titleLink(item)}
                        </p>
                    </div>
                    <div className={item.comments_count > 0 || isJob ? 'laptop item-header' : 'laptop'}>
                        <p>
                            {titleLink(item)}
                            {hasExternalUrl(item) && item.domain && (
                                <>
                                    {' '}
                                    <span className="domain">({item.domain})</span>
                                </>
                            )}
                        </p>
                        <div className="subtext">
                            {!isJob && (
                                <span>
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                                </span>
                            )}
                            <span className={!isJob ? 'item-details' : undefined}>
                                {item.time_ago}
                                {!isJob && (
                                    <span>
                                        {' '}
                                        | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, i) => (
                                <div key={i} className="pollContent">
                                    <div dangerouslySetInnerHTML={sanitizeHtml(pollResult.content)} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={sanitizeHtml(item.content)} />
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
