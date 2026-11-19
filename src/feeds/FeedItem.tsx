import { Link } from 'react-router-dom';

import type { Story } from '../shared/models/story';
import { useSettings } from '../shared/settings/SettingsContext';
import { formatCommentCount } from '../shared/utils/formatCommentCount';
import { hasExternalUrl } from '../shared/utils/hasExternalUrl';
import './FeedItem.scss';

interface FeedItemProps {
    item: Story;
    className?: string;
}

export default function FeedItem({ item, className }: FeedItemProps) {
    const { settings } = useSettings();
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const newTabProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    const isJob = item.type === 'job';

    return (
        <div className={className ? `feed-item ${className}` : 'feed-item'}>
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasExternalUrl(item) ? (
                    <p>
                        <a className="title" style={titleStyle} href={item.url} {...newTabProps}>
                            {item.title}
                        </a>{' '}
                        {item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
                            {item.title}
                        </Link>
                    </p>
                )}
                <div className="subtext-palm">
                    {!isJob && (
                        <div className="details">
                            <span className="name">
                                <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>{' '}
                            <span className="right">{item.points} ★</span>
                        </div>
                    )}
                    <div className="details">
                        {item.time_ago}{' '}
                        {!isJob && (
                            <Link to={`/item/${item.id}`} className="comment-number">
                                {' '}
                                • {formatCommentCount(item.comments_count)}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {!isJob && (
                        <span>
                            {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                        </span>
                    )}
                    <span className={!isJob ? 'item-details' : undefined}>
                        {item.time_ago}
                        {!isJob && (
                            <span>
                                {' '}
                                | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
