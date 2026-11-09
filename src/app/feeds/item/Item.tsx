import { NavLink } from 'react-router-dom';

import { Story } from '../../shared/models/story';
import { useSettings } from '../../shared/settings/settings';
import { formatCommentCount } from '../../shared/utils/comment';
import { externalLinkProps, hasExternalUrl } from '../../shared/utils/url';
import './Item.scss';

export default function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const isJob = item.type === 'job';

    return (
        <div className="app-item item-block">
            <div style={{ marginBottom: `${settings.listSpacing}px` }}>
                {hasExternalUrl(item) ? (
                    <p>
                        <a
                            className="title"
                            style={titleStyle}
                            href={item.url}
                            {...externalLinkProps(settings.openLinkInNewTab)}
                        >
                            {item.title}
                        </a>
                        {item.domain && <span className="domain"> ({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <NavLink className="title" style={titleStyle} to={`/item/${item.id}`}>
                            {item.title}
                        </NavLink>
                    </p>
                )}
                <div className="subtext-palm">
                    {!isJob && (
                        <div className="details">
                            <span className="name">
                                <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                            </span>
                            <span className="right">{item.points} ★</span>
                        </div>
                    )}
                    <div className="details">
                        {item.time_ago}
                        {!isJob && (
                            <NavLink to={`/item/${item.id}`} className="comment-number">
                                {' • '}
                                {formatCommentCount(item.comments_count)}
                            </NavLink>
                        )}
                    </div>
                </div>
                <div className="subtext-laptop">
                    {!isJob && (
                        <span>
                            {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>{' '}
                        </span>
                    )}
                    <span className={isJob ? undefined : 'item-details'}>
                        {item.time_ago}
                        {!isJob && (
                            <span>
                                {' | '}
                                <NavLink to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</NavLink>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
