import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackerNewsApi';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { Story } from '../../models';
import { useSettings } from '../../settings';
import { cx, formatComments } from '../../utils';
import { Comment } from './Comment';
import styles from './ItemDetailsPage.module.scss';

const ERROR_MESSAGE = 'Could not load item comments.';

interface ItemState {
    id: string;
    item: Story | null;
    errorMessage: string;
}

function isAbortError(error: unknown): boolean {
    return (error as { name?: string } | null)?.name === 'AbortError';
}

function pollBarWidth(points: number, total: number | undefined): string {
    return total ? `${(points / total) * 100}%` : '0%';
}

export function ItemDetailsPage() {
    const { id = '' } = useParams<'id'>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [state, setState] = useState<ItemState | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetchItemContent(id, { signal: controller.signal }).then(
            (item) => setState({ id, item, errorMessage: '' }),
            (error: unknown) => {
                if (!isAbortError(error)) {
                    setState({ id, item: null, errorMessage: ERROR_MESSAGE });
                }
            }
        );
        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);

    const current = state?.id === id ? state : null;
    const item = current?.item ?? null;
    const errorMessage = current?.errorMessage ?? '';

    const goBack = () => navigate(-1);
    const linkTarget = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    const renderTitle = (story: Story) =>
        (story.url ?? '').indexOf('http') === 0 ? (
            <a className={styles.title} href={story.url} {...linkTarget}>
                {story.title}
            </a>
        ) : (
            <NavLink className={styles.title} to={`/item/${story.id}`}>
                {story.title}
            </NavLink>
        );

    const hasUrl = (item?.url ?? '').indexOf('http') === 0;
    const hasHeader = !!item && (item.comments_count > 0 || item.type === 'job');

    return (
        <div className={styles.mainContent}>
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className={styles.item}>
                    <div className={cx('mobile', styles.mobile, 'item-header', styles.itemHeader)}>
                        <p className={styles.titleBlock}>
                            <span
                                className={cx('back-button', styles.backButton)}
                                role="button"
                                tabIndex={0}
                                aria-label="Go back"
                                onClick={goBack}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        goBack();
                                    }
                                }}
                            />
                            {renderTitle(item)}
                        </p>
                    </div>
                    <div
                        className={cx(
                            'laptop',
                            styles.laptop,
                            hasHeader && 'item-header',
                            hasHeader && styles.itemHeader,
                            item.text && 'head-margin',
                            item.text && styles.headMargin
                        )}
                    >
                        <p>
                            {renderTitle(item)}
                            {hasUrl && item.domain && (
                                <>
                                    {' '}
                                    <span className={cx('domain', styles.domain)}>({item.domain})</span>
                                </>
                            )}
                        </p>
                        <div className={cx('subtext', styles.subtext)}>
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by{' '}
                                    <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                                </span>
                            )}{' '}
                            <span className={cx(item.type !== 'job' && styles.itemDetails)}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' | '}
                                        <NavLink to={`/item/${item.id}`}>{formatComments(item.comments_count)}</NavLink>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className={styles.pollResults}>
                            {(item.poll ?? []).map((pollResult, index) => (
                                <div key={index} className={cx('pollContent', styles.pollContent)}>
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className={cx('subtext', styles.subtext)}>{pollResult.points} points</div>
                                    <div
                                        className={cx('pollBar', styles.pollBar)}
                                        style={{ width: pollBarWidth(pollResult.points, item.poll_votes_count) }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
                    <ul className={styles.commentList}>
                        {(item.comments ?? []).map((comment) => (
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

export default ItemDetailsPage;
