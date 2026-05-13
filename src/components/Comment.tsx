import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../models/comment';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

export function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="deleted-comment">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className="comment-wrapper">
            <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                <span className="collapse" onClick={() => setCollapse((v) => !v)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                {!collapse && (
                    <div>
                        <p
                            className="comment-text"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                        <ul className="subtree">
                            {comment.comments?.map((sub) => (
                                <li key={sub.id}>
                                    <Comment comment={sub} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
