import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import type { Comment as CommentModel } from '../../models';
import { cx } from '../../utils/cx';
import styles from './Comment.module.scss';

export interface CommentProps {
    comment: CommentModel;
}

/** Port of Angular's recursive <app-comment>. */
export function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div>
                <div className={cx(styles.deletedMeta, 'deleted-meta')}>
                    <span className={styles.collapse}>[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={cx(styles.meta, 'meta', collapse && styles.metaCollapse)}>
                <span className={styles.collapse} onClick={() => setCollapse((value) => !value)}>
                    [{collapse ? '+' : '-'}]
                </span>
                <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
                <span className={styles.time}>{comment.time_ago}</span>
            </div>
            <div className={styles.commentTree}>
                <div hidden={collapse}>
                    <p className={styles.commentText} dangerouslySetInnerHTML={{ __html: comment.content }} />
                    <ul className={styles.subtree}>
                        {comment.comments.map((subComment) => (
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
