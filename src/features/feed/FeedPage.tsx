import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackerNewsApi';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { FeedName, Story } from '../../models';
import { cx } from '../../utils';
import { FeedItem } from './FeedItem';
import styles from './FeedPage.module.scss';

export interface FeedPageProps {
    feedType: FeedName;
}

export const ITEMS_PER_PAGE = 30;

interface FeedResult {
    page: number;
    items: Story[] | null;
    errorMessage: string;
}

export function parsePage(page: string | undefined): number {
    const pageNum = Number(page);
    return Number.isInteger(pageNum) && pageNum >= 1 ? pageNum : 1;
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams<'page'>();
    const pageNum = parsePage(page);
    const [result, setResult] = useState<FeedResult | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetchFeed(feedType, pageNum, { signal: controller.signal }).then(
            (items) => {
                setResult({ page: pageNum, items, errorMessage: '' });
                window.scrollTo(0, 0);
            },
            (error: unknown) => {
                if (controller.signal.aborted || isAbortError(error)) {
                    return;
                }
                setResult({ page: pageNum, items: null, errorMessage: 'Could not load ' + feedType + ' stories.' });
            }
        );
        return () => controller.abort();
    }, [feedType, pageNum]);

    const current = result?.page === pageNum ? result : null;
    const items = current?.items ?? null;
    const errorMessage = current?.errorMessage ?? '';
    const listStart = (pageNum - 1) * ITEMS_PER_PAGE + 1;

    return (
        <div className={styles.mainContent}>
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className={cx('job-header', styles.jobHeader)}>
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={cx(styles.list, feedType !== 'jobs' && styles.listMargin)} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className={styles.post}>
                                <FeedItem className={styles.itemBlock} item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className={cx('nav', styles.nav)}>
                        {pageNum > 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className={cx('prev', styles.prev)}>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === ITEMS_PER_PAGE && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className={cx('more', styles.more)}>
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
