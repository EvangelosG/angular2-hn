import { Link, useParams } from 'react-router-dom';

import { useFeed } from '../../../hooks/useHackerNews';
import ErrorMessage from '../../shared/ErrorMessage/ErrorMessage';
import Loader from '../../shared/Loader/Loader';
import Item from '../Item/Item';
import './feed.scss';

interface FeedProps {
    feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const { data: items, error } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * 30 + 1;

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
