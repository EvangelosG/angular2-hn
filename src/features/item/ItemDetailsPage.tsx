import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent, isAbortError } from '../../api/hackerNewsApi';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { Story } from '../../models';
import { useSettings } from '../../settings';
import { commentCount } from '../../utils/commentCount';
import { cx } from '../../utils/cx';
import { Comment } from './Comment';
import styles from './ItemDetailsPage.module.scss';

/** Port of Angular's ItemDetailsComponent (/item/:id). */
export function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchItemContent(Number(id), controller.signal)
            .then(setItem)
            .catch((error: unknown) => {
                if (!isAbortError(error)) setErrorMessage('Could not load item comments.');
            });
        return () => controller.abort();
    }, [id]);

    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div className={styles.mainContent}>
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <ItemDetails
                    item={item}
                    target={target}
                    rel={rel}
                    onBack={() => navigate(-1)}
                />
            )}
        </div>
    );
}

interface ItemDetailsProps {
    item: Story;
    target?: string;
    rel?: string;
    onBack(): void;
}

function ItemDetails({ item, target, rel, onBack }: ItemDetailsProps) {
    const hasUrl = typeof item.url === 'string' && item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const linkClass = cx(styles.link, styles.title);

    const externalTitle = (
        <a className={linkClass} href={item.url} target={target} rel={rel}>
            {item.title}
        </a>
    );
    const internalTitle = (
        <NavLink className={linkClass} to={`/item/${item.id}`}>
            {item.title}
        </NavLink>
    );

    return (
        <div className={styles.item}>
            <div className={cx(styles.mobile, styles.itemHeader, 'item-header')}>
                <p className={cx(styles.para, styles.titleBlock)}>
                    <span className={cx(styles.backButton, 'back-button')} onClick={onBack} />
                    {hasUrl ? externalTitle : internalTitle}
                </p>
            </div>
            <div
                className={cx(
                    styles.laptop,
                    (item.comments_count > 0 || isJob) && cx(styles.itemHeader, 'item-header')
                )}
            >
                {hasUrl ? (
                    <p className={styles.para}>
                        {externalTitle}{' '}
                        {item.domain && <span className={cx(styles.domain, 'domain')}>({item.domain})</span>}
                    </p>
                ) : (
                    <p className={styles.para}>{internalTitle}</p>
                )}
                <div className={cx(styles.subtext, 'subtext')}>
                    {!isJob && (
                        <span>
                            {item.points} points by{' '}
                            <NavLink className={styles.link} to={`/user/${item.user}`}>
                                {item.user}
                            </NavLink>
                        </span>
                    )}
                    <span className={cx(!isJob && styles.itemDetails)}>
                        {' '}
                        {item.time_ago}
                        {!isJob && (
                            <span>
                                {' | '}
                                <NavLink className={styles.link} to={`/item/${item.id}`}>
                                    {commentCount(item.comments_count)}
                                </NavLink>
                            </span>
                        )}
                    </span>
                </div>
            </div>
            {item.type === 'poll' && (
                <div className={styles.pollResults}>
                    {item.poll?.map((pollResult, index) => (
                        <div key={index} className={cx(styles.pollContent, 'pollContent')}>
                            <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                            <div className={cx(styles.subtext, 'subtext')}>{pollResult.points} points</div>
                            <div
                                className={cx(styles.pollBar, 'pollBar')}
                                data-testid="poll-bar"
                                style={{ width: pollBarWidth(pollResult.points, item.poll_votes_count) }}
                            />
                        </div>
                    ))}
                </div>
            )}
            <p className={cx(styles.para, styles.subject)} dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
            <ul className={styles.commentList}>
                {item.comments?.map((comment) => (
                    <li key={comment.id} className={styles.commentListItem}>
                        <Comment comment={comment} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function pollBarWidth(points: number, total: number | undefined): string {
    const percent = total ? (points / total) * 100 : 0;
    return `${percent}%`;
}
