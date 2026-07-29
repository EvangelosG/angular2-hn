import { Link } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import { Story } from '../models/story';
import { commentLabel } from '../utils/commentLabel';

import './Item.scss';

export default function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const hasUrl = (item.url || '').indexOf('http') === 0;
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const isStory = item.type !== 'job';

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={titleStyle}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
                    >
                        {item.title}
                    </a>
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
                {isStory && (
                    <div className="details">
                        <span className="name">
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {isStory && (
                        <Link to={`/item/${item.id}`} className="comment-number">
                            {' '}
                            • {commentLabel(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {isStory && (
                    <span>
                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                    </span>
                )}
                <span className={isStory ? 'item-details' : undefined}>
                    {item.time_ago}
                    {isStory && (
                        <span>
                            {' '}
                            | <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
