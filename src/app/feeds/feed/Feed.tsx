import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Story } from '../../shared/models/story';
import { fetchFeed } from '../../shared/api/hackernews-api';
import Loader from '../../shared/components/loader/Loader';
import ErrorMessage from '../../shared/components/error-message/ErrorMessage';
import Item from '../item/Item';
import './Feed.scss';

export type FeedName = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

interface LoadedFeed {
    items: Story[];
    pageNum: number;
}

export default function Feed({ feedType }: { feedType: FeedName }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const [feed, setFeed] = useState<LoadedFeed | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let ignore = false;
        fetchFeed(feedType, pageNum)
            .then((items) => {
                if (ignore) {
                    return;
                }
                setFeed({ items, pageNum });
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!ignore) {
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                }
            });
        return () => {
            ignore = true;
        };
    }, [feedType, pageNum]);

    const listStart = feed ? (feed.pageNum - 1) * 30 + 1 : 1;

    return (
        <div className="app-feed">
            <div className="main-content">
                {!feed && !errorMessage && <Loader />}
                {!feed && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

                {feed && (
                    <div>
                        {feedType === 'jobs' && (
                            <p className="job-header">
                                These are jobs at startups that were funded by Y Combinator. You can also get a job at
                                a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                            </p>
                        )}
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {feed.items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <Link to={`/${feedType}/${feed.pageNum - 1}`} className="prev">
                                    ‹ Prev
                                </Link>
                            )}
                            {feed.items.length === 30 && (
                                <Link to={`/${feedType}/${feed.pageNum + 1}`} className="more">
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
