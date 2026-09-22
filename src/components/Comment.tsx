import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../models/comment';
import { useSettings } from '../context/SettingsContext';
import { renderCommentHtml } from '../utils/comment';

import './comment.scss';

export interface CommentProps {
    comment: CommentModel;
}

export default function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);
    const { settings } = useSettings();

    if (comment.deleted) {
        return (
            <div>
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    const childCount = comment.comments ? comment.comments.length : 0;

    return (
        <div className="comment">
            <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                <span className="collapse" onClick={() => setCollapse(!collapse)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
                {collapse && childCount > 0 && (
                    <span className="child-count">
                        | {childCount} {childCount === 1 ? 'reply' : 'replies'}
                    </span>
                )}
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p
                        className="comment-text"
                        dangerouslySetInnerHTML={{
                            __html: renderCommentHtml(comment.content, settings.openLinkInNewTab),
                        }}
                    />
                    <ul className="subtree">
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
