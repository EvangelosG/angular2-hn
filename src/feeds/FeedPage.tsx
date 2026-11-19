import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useFeed } from '../shared/api/queries';
import type { FeedName } from '../shared/models/feed-type';
import Loader from '../shared/components/Loader';
import ErrorMessage from '../shared/components/ErrorMessage';
import FeedItem from './FeedItem';
import './FeedPage.scss';

const PAGE_SIZE = 30;

export default function FeedPage({ feedType }: { feedType: FeedName }) {
    const params = useParams<{ page: string }>();
    const pageNum = Number(params.page) || 1;
    const { data, isError, isPlaceholderData } = useFeed(feedType, pageNum);

    const loadedPage = data?.page;
    useEffect(() => {
        if (loadedPage !== undefined && !isPlaceholderData) {
            window.scrollTo(0, 0);
        }
    }, [loadedPage, isPlaceholderData]);

    const items = data?.items;
    const listStart = loadedPage !== undefined ? (loadedPage - 1) * PAGE_SIZE + 1 : 1;

    return (
        <div className="main-content feed-page">
            {!items && !isError && <Loader />}
            {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'feed-list list-margin' : 'feed-list'} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <FeedItem className="item-block" item={item} />
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
    );
}
