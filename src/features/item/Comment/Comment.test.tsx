import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Comment as CommentModel } from '../../../models';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { Comment } from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>Top <b>comment</b></p>',
        comments: [],
        ...overrides,
    };
}

describe('Comment', () => {
    it('renders the author link, time and HTML content', () => {
        const { container } = renderWithProviders(<Comment comment={makeComment()} />);

        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('2 hours ago')).toBeInTheDocument();
        expect(container.querySelector('b')).toHaveTextContent('comment');
        expect(container.querySelector('.meta')).not.toBeNull();
    });

    it('renders nested replies recursively', () => {
        renderWithProviders(
            <Comment
                comment={makeComment({
                    comments: [
                        makeComment({
                            id: 2,
                            user: 'bob',
                            content: 'Reply',
                            comments: [makeComment({ id: 3, user: 'carol', content: 'Deep reply' })],
                        }),
                    ],
                })}
            />
        );

        expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
        expect(screen.getByRole('link', { name: 'carol' })).toBeInTheDocument();
        expect(screen.getByText('Deep reply')).toBeInTheDocument();
    });

    it('collapses and expands the comment tree', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <Comment comment={makeComment({ comments: [makeComment({ id: 2, user: 'bob', content: 'Reply' })] })} />
        );

        const [toggle] = screen.getAllByRole('button');
        expect(toggle).toHaveTextContent('[-]');
        expect(screen.getByText('Reply')).toBeVisible();

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByText('Reply')).not.toBeVisible();
        expect(screen.queryByRole('link', { name: 'bob' })).not.toBeInTheDocument();

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[-]');
        expect(screen.getByText('Reply')).toBeVisible();
    });

    it('toggles with the keyboard', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Comment comment={makeComment()} />);

        screen.getByRole('button').focus();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('button')).toHaveTextContent('[+]');
    });

    it('renders deleted comments with the deleted meta and no author', () => {
        const { container } = renderWithProviders(
            <Comment comment={makeComment({ deleted: true, user: null, content: '' })} />
        );

        const meta = container.querySelector('.deleted-meta');
        expect(meta).toHaveTextContent('[deleted] | Comment Deleted');
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
