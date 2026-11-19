import { Link } from 'react-router-dom';

import type { Story } from '../../../models';
import { useSettings } from '../../../settings';
import { cx, formatComments } from '../../../utils';
import styles from './FeedItem.module.scss';

export interface FeedItemProps {
    item: Story;
    className?: string;
}

/** Port of Angular's feeds/item component: one story row in a feed list. */
export function FeedItem({ item, className }: FeedItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const titleStyle = { fontSize: settings.titleFontSize + 'px' };
    const comments = formatComments(item.comments_count);

    return (
        <div className={cx(styles.item, className)} style={{ marginBottom: settings.listSpacing + 'px' }}>
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
                    {item.domain && <span className={cx('domain', styles.domain)}>({item.domain})</span>}
                </p>
            ) : (
                <p>
                    <Link className={styles.title} style={titleStyle} to={`/item/${item.id}`}>
                        {item.title}
                    </Link>
                </p>
            )}
            <div className={cx('subtext-palm', styles.subtextPalm)}>
                {!isJob && (
                    <div className={styles.details}>
                        <span className={styles.name}>
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className={styles.right}>{item.points} ★</span>
                    </div>
                )}
                <div className={styles.details}>
                    {item.time_ago}{' '}
                    {!isJob && (
                        <Link to={`/item/${item.id}`} className={styles.commentNumber}>
                            {' '}
                            • {comments}
                        </Link>
                    )}
                </div>
            </div>
            <div className={cx('subtext-laptop', styles.subtextLaptop)}>
                {!isJob && (
                    <span>
                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                    </span>
                )}
                <span className={cx(!isJob && styles.itemDetails)}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' | '}
                            <Link to={`/item/${item.id}`}>{comments}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
