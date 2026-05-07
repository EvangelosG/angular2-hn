import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../hooks/useHackerNewsApi';
import type { Story } from '../../models';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Item from './Item';

interface FeedProps {
    feedType: string;
}

function parsePage(pageParam: string | undefined): number {
    const parsed = Number(pageParam);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return 1;
    }
    return Math.floor(parsed);
}

function Feed({ feedType }: FeedProps) {
    const { page: pageParam } = useParams<{ page: string }>();
    const pageNum = parsePage(pageParam);
    const listStart = (pageNum - 1) * 30 + 1;

    const [items, setItems] = useState<Story[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let ignored = false;
        setLoading(true);
        setErrorMessage(null);
        setItems(null);

        fetchFeed(feedType, pageNum)
            .then((stories) => {
                if (ignored) return;
                setItems(stories);
            })
            .catch(() => {
                if (ignored) return;
                setErrorMessage(`Could not load ${feedType} stories.`);
            })
            .finally(() => {
                if (ignored) return;
                setLoading(false);
                window.scrollTo(0, 0);
            });

        return () => {
            ignored = true;
        };
    }, [feedType, pageNum]);

    const handleNavScroll = () => {
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="main-content">
                <Loader />
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="main-content">
                <ErrorMessage message={errorMessage} />
            </div>
        );
    }

    if (!items) {
        return <div className="main-content" />;
    }

    const olClassName = feedType !== 'jobs' ? 'list-margin' : undefined;

    return (
        <div className="main-content">
            <div>
                {feedType === 'jobs' && (
                    <p className="job-header">
                        These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                        startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                    </p>
                )}
                <ol className={olClassName} start={listStart}>
                    {items.map((item) => (
                        <li key={item.id} className="post">
                            <Item item={item} />
                        </li>
                    ))}
                </ol>
                <div className="nav">
                    {listStart !== 1 && (
                        <Link to={`/${feedType}/${pageNum - 1}`} className="prev" onClick={handleNavScroll}>
                            ‹ Prev
                        </Link>
                    )}
                    {items.length === 30 && (
                        <Link to={`/${feedType}/${pageNum + 1}`} className="more" onClick={handleNavScroll}>
                            More ›
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Feed;
