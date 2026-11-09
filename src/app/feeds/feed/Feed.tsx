import { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import ErrorMessage from '../../shared/components/error-message/ErrorMessage';
import Loader from '../../shared/components/loader/Loader';
import { useFetch } from '../../shared/hooks/useFetch';
import { fetchFeed, FeedName } from '../../shared/services/hackernews-api';
import Item from '../item/Item';
import './Feed.scss';

const PAGE_SIZE = 30;

export default function Feed({ feedType }: { feedType: FeedName }) {
    const { page } = useParams();
    const pageNum = page ? Number(page) : 1;
    const { data: items, error } = useFetch((signal) => fetchFeed(feedType, pageNum, signal), [feedType, pageNum]);
    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="app-feed">
            <div className="main-content">
                {!items && !error && <Loader />}
                {!items && !!error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

                {items && (
                    <div>
                        {feedType === 'jobs' && (
                            <p className="job-header">
                                These are jobs at startups that were funded by Y Combinator. You can also get a job at
                                a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                            </p>
                        )}
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <NavLink to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    ‹ Prev
                                </NavLink>
                            )}
                            {items.length === PAGE_SIZE && (
                                <NavLink to={`/${feedType}/${pageNum + 1}`} className="more">
                                    More ›
                                </NavLink>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
