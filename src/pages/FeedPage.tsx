import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Story } from '../types/story';
import { fetchFeed } from '../api/hackernews';
import { Loader } from '../components/shared/Loader';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { FeedItem } from '../components/feeds/FeedItem';
import './FeedPage.scss';

interface FeedPageProps {
    feedType: string;
}

export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setItems(null);
        setErrorMessage('');

        const controller = new AbortController();
        fetchFeed(feedType, pageNum, controller.signal)
            .then((data) => {
                setItems(data);
                window.scrollTo(0, 0);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setErrorMessage(
                        `Could not load ${feedType} stories.`
                    );
                }
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    return (
        <div className="main-content feed-page-wrapper">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && (
                <ErrorMessage message={errorMessage} />
            )}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y
                            Combinator. You can also get a job at a YC startup
                            through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">
                                Triplebyte
                            </a>
                            .
                        </p>
                    )}
                    <ol
                        className={feedType !== 'jobs' ? 'list-margin' : ''}
                        start={listStart}
                    >
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <FeedItem item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link
                                to={`/${feedType}/${pageNum - 1}`}
                                className="prev"
                            >
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link
                                to={`/${feedType}/${pageNum + 1}`}
                                className="more"
                            >
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
