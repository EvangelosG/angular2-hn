import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Item from '../../components/Item/Item';
import Loader from '../../components/Loader/Loader';
import { fetchFeed } from '../../api/hackernews';
import { FeedName } from '../../models/feed-type.type';
import { Story } from '../../models/story';
import './Feed.scss';

const ITEMS_PER_PAGE = 30;

interface FeedState {
    key: string;
    items: Story[] | null;
    error: string;
}

export default function Feed({ feedType }: { feedType: FeedName }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;
    const [feed, setFeed] = useState<FeedState>({ key: '', items: null, error: '' });
    const feedKey = `${feedType}/${pageNum}`;

    useEffect(() => {
        const controller = new AbortController();

        fetchFeed(feedType, pageNum, controller.signal)
            .then((items) => {
                setFeed({ key: `${feedType}/${pageNum}`, items, error: '' });
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setFeed({
                        key: `${feedType}/${pageNum}`,
                        items: null,
                        error: `Could not load ${feedType} stories.`,
                    });
                }
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    const items = feed.key === feedKey ? feed.items : null;
    const errorMessage = feed.key === feedKey ? feed.error : '';
    const listStart = (pageNum - 1) * ITEMS_PER_PAGE + 1;

    return (
        <div className="app-feed">
            <div className="main-content">
                {!items && !errorMessage && <Loader />}
                {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    ‹ Prev
                                </Link>
                            )}
                            {items.length === ITEMS_PER_PAGE && (
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
