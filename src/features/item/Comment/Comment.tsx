import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import type { Comment as CommentModel } from '../../../models';
import { cx } from '../../../utils';
import styles from './Comment.module.scss';

export interface CommentProps {
    comment: CommentModel;
}

export function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className={styles.comment}>
                <div className={cx('deleted-meta', styles.deletedMeta)}>
                    <span className={styles.collapse}>[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    const toggle = () => setCollapse((value) => !value);

    return (
        <div className={styles.comment}>
            <div className={cx('meta', styles.meta, collapse && styles.metaCollapse)}>
                <span
                    className={styles.collapse}
                    role="button"
                    tabIndex={0}
                    aria-expanded={!collapse}
                    onClick={toggle}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            toggle();
                        }
                    }}
                >
                    [{collapse ? '+' : '-'}]
                </span>
                <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
                <span className={styles.time}>{comment.time_ago}</span>
            </div>
            <div className={styles.commentTree}>
                <div hidden={collapse}>
                    <p className={styles.commentText} dangerouslySetInnerHTML={{ __html: comment.content }} />
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
