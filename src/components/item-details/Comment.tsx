import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../../models';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="comment">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    const toggleLabel = collapse ? '[+]' : '[-]';

    return (
        <div className={`comment level-${comment.level ?? 0}`}>
            <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                <button
                    type="button"
                    className="collapse"
                    onClick={() => setCollapse((value) => !value)}
                    aria-label="Toggle comment"
                >
                    {toggleLabel}
                </button>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            {!collapse && (
                <div className="comment-tree">
                    <div>
                        <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
                        <ul className="subtree">
                            {comment.comments.map((subComment) => (
                                <li key={subComment.id}>
                                    <Comment comment={subComment} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Comment;
