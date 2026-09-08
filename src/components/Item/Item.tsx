import { Link } from 'react-router-dom';

import { useSettings } from '@/context/SettingsContext';
import type { Story } from '@/models/story';
import { formatCommentCount } from '@/utils/comment';

import styles from './Item.module.scss';

export interface ItemProps {
  item: Story;
}

export default function Item({ item }: ItemProps) {
  const { settings } = useSettings();

  const hasUrl = typeof item.url === 'string' && item.url.indexOf('http') === 0;
  const isJob = item.type === 'job';

  return (
    <div className={styles.item} style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a
            className={styles.title}
            style={{ fontSize: `${settings.titleFontSize}px` }}
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
          >
            {item.title}
          </a>
          {item.domain && <span className="domain">({item.domain})</span>}
        </p>
      ) : (
        <p>
          <Link
            className={styles.title}
            style={{ fontSize: `${settings.titleFontSize}px` }}
            to={`/item/${item.id}`}
          >
            {item.title}
          </Link>
        </p>
      )}

      <div className="subtext-palm">
        {!isJob && (
          <div className={styles.details}>
            <span className="name">
              <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
            <span className={styles.right}>{item.points} ★</span>
          </div>
        )}
        <div className={styles.details}>
          {item.time_ago}
          {!isJob && (
            <Link to={`/item/${item.id}`} className={styles['comment-number']}>
              {' '}
              • {formatCommentCount(item.comments_count)}
            </Link>
          )}
        </div>
      </div>

      <div className="subtext-laptop">
        {!isJob && (
          <span>
            {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
          </span>
        )}
        <span className={isJob ? undefined : styles['item-details']}>
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
  );
}
