import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '@/models/comment';

import styles from './Comment.module.scss';

export interface CommentProps {
  comment: CommentModel;
}

export default function Comment({ comment }: CommentProps) {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div className={styles.comment}>
        <div className="deleted-meta">
          <span className={styles.collapse}>[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className={styles.comment}>
      <div className={`meta${collapse ? ` ${styles['meta-collapse']}` : ''}`}>
        <span className={styles.collapse} onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className={styles.time}>{comment.time_ago}</span>
      </div>
      <div className={styles['comment-tree']}>
        <div hidden={collapse}>
          <p
            className={styles['comment-text']}
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          <ul className={styles.subtree}>
            {(comment.comments ?? []).map((subComment) => (
              <li key={subComment.id}>
                <Comment comment={subComment} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
