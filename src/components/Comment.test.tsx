import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Comment as CommentModel } from '../models/comment';
import Comment from './Comment';

function buildComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>parent comment</p>',
        deleted: false,
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
    it('renders nested comments recursively', () => {
        renderComment(
            buildComment({
                comments: [buildComment({ id: 2, user: 'dang', content: '<p>child comment</p>' })],
            })
        );

        expect(screen.getByText('parent comment')).toBeInTheDocument();
        expect(screen.getByText('child comment')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'dang' })).toHaveAttribute('href', '/user/dang');
    });

    it('collapses and expands the comment tree', async () => {
        const user = userEvent.setup();
        renderComment(buildComment());

        await user.click(screen.getByText('[-]'));
        expect(screen.getByText('parent comment')).not.toBeVisible();

        await user.click(screen.getByText('[+]'));
        expect(screen.getByText('parent comment')).toBeVisible();
    });

    it('renders the deleted branch', () => {
        renderComment(buildComment({ deleted: true }));

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByText('parent comment')).not.toBeInTheDocument();
    });
});
