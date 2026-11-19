import { useEffect } from 'react';
import { Link, useParams } from 'react-router';

import { useFeed } from '../../shared/api/queries';
import type { Feed as FeedName } from '../../shared/models/feed-type.type';
import { ErrorMessage } from '../../shared/components/error-message/ErrorMessage';
import { Loader } from '../../shared/components/loader/Loader';
import { FeedItem } from '../item/FeedItem';
import './Feed.scss';

const PAGE_SIZE = 30;

export function Feed({ feedType }: { feedType: FeedName }) {
    const { page } = useParams();
    const pageNum = page ? Number(page) : 1;
    const { data, isError, isPlaceholderData } = useFeed(feedType, pageNum);

    const loadedPage = data?.page;
    useEffect(() => {
        if (loadedPage !== undefined && !isPlaceholderData) {
            window.scrollTo(0, 0);
        }
    }, [loadedPage, isPlaceholderData]);

    const items = data?.items;
    const listStart = ((data?.page ?? pageNum) - 1) * PAGE_SIZE + 1;

    return (
        <div className="app-feed">
            <div className="main-content">
                {!items && !isError && <Loader />}
                {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

                {items && (
                    <div>
                        {feedType === 'jobs' && (
                            <p className="job-header">
                                These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                                YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                            </p>
                        )}
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <FeedItem item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    ‹ Prev
                                </Link>
                            )}
                            {items.length === PAGE_SIZE && (
                                <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                    More ›
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
