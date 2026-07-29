import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hackernews';
import { ErrorMessage } from '../components/error-message/ErrorMessage';
import { Loader } from '../components/loader/Loader';
import type { Story } from '../models/story';
import { Item } from './Item';
import './Feed.scss';

export function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[] | undefined>();
    const [listStart, setListStart] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchFeed(feedType, pageNum)
            .then((stories) => {
                if (cancelled) {
                    return;
                }
                setItems(stories);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [feedType, pageNum]);

    return (
        <div className="main-content feed">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
