import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../models';
import { Comment } from './Comment';

function buildComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>parent</p>',
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
    it('renders child comments recursively', () => {
        renderComment(
            buildComment({
                comments: [
                    buildComment({
                        id: 2,
                        user: 'dang',
                        content: '<p>child</p>',
                        comments: [buildComment({ id: 3, user: 'sama', content: '<p>grandchild</p>' })],
                    }),
                ],
            })
        );

        expect(screen.getByText('parent')).toBeInTheDocument();
        expect(screen.getByText('child')).toBeInTheDocument();
        expect(screen.getByText('grandchild')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'sama' })).toHaveAttribute('href', '/user/sama');
    });

    it('collapses and expands the comment tree', async () => {
        const user = userEvent.setup();
        const { container } = renderComment(buildComment({ comments: [buildComment({ id: 2, user: 'dang' })] }));

        const [toggle] = screen.getAllByText('[-]');
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');

        await user.click(toggle);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
    });

    it('renders the deleted branch', () => {
        renderComment(buildComment({ deleted: true }));

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByText('parent')).not.toBeInTheDocument();
    });
});
