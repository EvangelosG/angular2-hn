import { Link } from 'react-router-dom';

import type { Story } from '../../models/story';
import { useSettings } from '../../settings';
import { commentCount } from '../../utils/commentCount';
import { cx } from '../../utils/cx';
import styles from './FeedItem.module.scss';

export interface FeedItemProps {
    item: Story;
}

/** Port of Angular's feeds/item component (one story row). */
export function FeedItem({ item }: FeedItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: settings.titleFontSize + 'px' };

    return (
        <div className={styles.itemBlock}>
            <div style={{ marginBottom: settings.listSpacing + 'px' }}>
                {hasUrl ? (
                    <p>
                        <a
                            className={styles.title}
                            style={titleStyle}
                            href={item.url}
                            target={settings.openLinkInNewTab ? '_blank' : undefined}
                            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                        >
                            {item.title}
                        </a>{' '}
                        {item.domain && <span className={cx(styles.domain, 'domain')}>({item.domain})</span>}
                    </p>
                ) : (
                    <p>
                        <Link className={styles.title} style={titleStyle} to={`/item/${item.id}`}>
                            {item.title}
                        </Link>
                    </p>
                )}
                <div className={cx(styles.subtextPalm, 'subtext-palm')} data-testid="subtext-palm">
                    {!isJob && (
                        <div className={styles.details}>
                            <span className={styles.name}>
                                <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                            <span className={styles.right}>{item.points} ★</span>
                        </div>
                    )}
                    <div className={styles.details}>
                        {item.time_ago}
                        {!isJob && (
                            <>
                                {' '}
                                <Link to={`/item/${item.id}`} className={styles.commentNumber}>
                                    • {commentCount(item.comments_count)}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className={cx(styles.subtextLaptop, 'subtext-laptop')} data-testid="subtext-laptop">
                    {!isJob && (
                        <span>
                            {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                    )}
                    <span className={cx(!isJob && styles.itemDetails)}>
                        {' '}
                        {item.time_ago}
                        {!isJob && (
                            <span>
                                {' | '}
                                <Link to={`/item/${item.id}`}>{commentCount(item.comments_count)}</Link>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
