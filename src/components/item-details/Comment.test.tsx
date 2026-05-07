import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../models';
import Comment from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>Hello</p>',
        comments: [],
        ...overrides,
    };
}

function renderComment(comment: CommentModel) {
    return render(
        <MemoryRouter>
            <Comment comment={comment} />
        </MemoryRouter>
    );
}

describe('Comment', () => {
    it('renders the comment body and child comments by default', () => {
        const comment = makeComment({
            content: '<p>Hello world</p>',
            comments: [makeComment({ id: 2, content: '<p>Reply</p>', user: 'bob' })],
        });
        renderComment(comment);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
        expect(screen.getByText('Reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
    });

    it('hides the body and child comments after toggling collapse, and re-shows them on second click', async () => {
        const user = userEvent.setup();
        const comment = makeComment({
            content: '<p>Top body</p>',
            comments: [makeComment({ id: 2, content: '<p>Reply body</p>', user: 'bob' })],
        });
        renderComment(comment);

        expect(screen.getByText('Top body')).toBeInTheDocument();
        expect(screen.getByText('Reply body')).toBeInTheDocument();

        const toggleButtons = screen.getAllByRole('button', { name: /toggle comment/i });
        await user.click(toggleButtons[0]);

        expect(screen.queryByText('Top body')).not.toBeInTheDocument();
        expect(screen.queryByText('Reply body')).not.toBeInTheDocument();

        const toggleAgain = screen.getAllByRole('button', { name: /toggle comment/i });
        await user.click(toggleAgain[0]);

        expect(screen.getByText('Top body')).toBeInTheDocument();
        expect(screen.getByText('Reply body')).toBeInTheDocument();
    });

    it('renders the [deleted] message when comment.deleted is true', () => {
        renderComment(makeComment({ deleted: true }));
        expect(screen.getByText(/comment deleted/i)).toBeInTheDocument();
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
    });
});
