import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Comment from '../../components/Comment/Comment';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import { fetchItemContent } from '../../api/hackernews';
import { Story } from '../../models/story';
import { commentLabel } from '../../utils/comment';
import { useSettings } from '../../context/SettingsContext';
import './ItemDetails.scss';

interface ItemState {
    key: string;
    item: Story | null;
    error: string;
}

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [state, setState] = useState<ItemState>({ key: '', item: null, error: '' });

    useEffect(() => {
        const controller = new AbortController();

        fetchItemContent(Number(id), controller.signal)
            .then((item) => setState({ key: id as string, item, error: '' }))
            .catch(() => {
                if (!controller.signal.aborted) {
                    setState({ key: id as string, item: null, error: 'Could not load item comments.' });
                }
            });

        window.scrollTo(0, 0);

        return () => controller.abort();
    }, [id]);

    const item = state.key === id ? state.item : null;
    const errorMessage = state.key === id ? state.error : '';

    const hasUrl = !!item?.url && item.url.indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    const laptopClasses = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClasses.push('item-header');
    }
    if (item?.text) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="app-item-details">
            <div className="main-content">
                {!item && !errorMessage && <Loader />}
                {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={() => navigate(-1)}></span>
                                {hasUrl ? (
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
                        <div className={laptopClasses.join(' ')}>
                            {hasUrl ? (
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
                                            <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
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
                            {(item.comments || []).map((comment) => (
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
