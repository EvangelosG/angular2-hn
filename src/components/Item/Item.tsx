import { Link } from 'react-router-dom';
import { Story } from '../../types/story';
import { useSettings } from '../../contexts/SettingsContext';
import { commentText } from '../../utils/commentText';
import './Item.scss';

interface ItemProps {
    story: Story;
}

export function Item({ story }: ItemProps) {
    const { settings } = useSettings();
    const hasUrl = story.url && story.url.indexOf('http') === 0;

    return (
        <div className="item-wrapper" style={{ marginBottom: settings.listSpacing + 'px' }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={{ fontSize: settings.titleFontSize + 'px' }}
                        href={story.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {story.title}
                    </a>
                    {story.domain && <span className="domain">({story.domain})</span>}
                </p>
            ) : (
                <p>
                    <Link
                        className="title"
                        style={{ fontSize: settings.titleFontSize + 'px' }}
                        to={`/item/${story.id}`}
                    >
                        {story.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {story.type !== 'job' && (
                    <div className="details">
                        <span className="name">
                            <Link to={`/user/${story.user}`}>{story.user}</Link>
                        </span>
                        <span className="right">{story.points} &#9733;</span>
                    </div>
                )}
                <div className="details">
                    {story.time_ago}
                    {story.type !== 'job' && (
                        <Link to={`/item/${story.id}`} className="comment-number">
                            {' '}
                            &bull; {commentText(story.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {story.type !== 'job' && (
                    <span>
                        {story.points} points by <Link to={`/user/${story.user}`}>{story.user}</Link>
                    </span>
                )}
                <span className={story.type !== 'job' ? 'item-details' : ''}>
                    {story.time_ago}
                    {story.type !== 'job' && (
                        <span>
                            {' '}
                            | <Link to={`/item/${story.id}`}>{commentText(story.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
