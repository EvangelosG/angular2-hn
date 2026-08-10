import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackerNewsApi';
import { useFetch } from '../../api/useFetch';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Item from '../Item/Item';
import Loader from '../Loader/Loader';
import './Feed.scss';

export default function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;

    const { data: items, error } = useFetch(
        (signal) => fetchFeed(feedType, pageNum, signal),
        `Could not load ${feedType} stories.`,
        [feedType, pageNum]
    );

    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="main-content">
            {!items && !error && <Loader />}
            {!items && error !== '' && <ErrorMessage message={error} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <div className="item-block">
                                    <Item item={item} />
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
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
