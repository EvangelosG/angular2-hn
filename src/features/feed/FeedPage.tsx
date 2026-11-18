import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed, isAbortError } from '../../api/hackerNewsApi';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { FeedType } from '../../models/feedType';
import type { Story } from '../../models/story';
import { cx } from '../../utils/cx';
import { FeedItem } from './FeedItem';
import styles from './FeedPage.module.scss';

export interface FeedPageProps {
    feedType: FeedType;
}

export const ITEMS_PER_PAGE = 30;

interface FeedResult {
    key: string;
    items?: Story[];
    errorMessage?: string;
}

/** Port of Angular's feeds/feed component. */
export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;
    const requestKey = `${feedType}/${pageNum}`;
    const [result, setResult] = useState<FeedResult | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetchFeed(feedType, pageNum, controller.signal)
            .then((items) => {
                if (!controller.signal.aborted) {
                    setResult({ key: requestKey, items });
                }
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted && !isAbortError(error)) {
                    setResult({ key: requestKey, errorMessage: `Could not load ${feedType} stories.` });
                }
            });
        return () => controller.abort();
    }, [feedType, pageNum, requestKey]);

    const current = result?.key === requestKey ? result : null;
    const items = current?.items;
    const errorMessage = current?.errorMessage ?? '';

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    const listStart = (pageNum - 1) * ITEMS_PER_PAGE + 1;

    return (
        <div className={styles.mainContent}>
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className={cx(styles.jobHeader, 'job-header')}>
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={cx(styles.list, feedType !== 'jobs' && styles.listMargin)} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className={styles.post}>
                                <FeedItem item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className={cx(styles.nav, 'nav')}>
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className={styles.prev}>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === ITEMS_PER_PAGE && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className={styles.more}>
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
