import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../models/comment';
import { Comment } from './Comment';

function comment(overrides: Partial<CommentModel>): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>Top level</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

function renderComment(model: CommentModel) {
    return render(
        <MemoryRouter>
            <Comment comment={model} />
        </MemoryRouter>
    );
}

describe('Comment', () => {
    it('renders comment html and nested replies recursively', () => {
        renderComment(
            comment({
                comments: [
                    comment({ id: 2, user: 'dang', content: '<p>Reply</p>', comments: [] }),
                    comment({
                        id: 3,
                        user: 'sama',
                        content: '<p>Another reply</p>',
                        comments: [comment({ id: 4, user: 'jl', content: '<p>Deep reply</p>' })],
                    }),
                ],
            })
        );

        expect(screen.getByText('Top level')).toBeInTheDocument();
        expect(screen.getByText('Reply')).toBeInTheDocument();
        expect(screen.getByText('Deep reply')).toBeInTheDocument();
        expect(screen.getByText('jl')).toHaveAttribute('href', '/user/jl');
    });

    it('collapses and expands its subtree', () => {
        const { container } = renderComment(comment({ comments: [comment({ id: 2, content: '<p>Reply</p>' })] }));
        const toggle = screen.getAllByText('[-]')[0];
        const subtree = () => container.querySelector('.comment-tree > div');

        expect(subtree()).not.toHaveAttribute('hidden');

        fireEvent.click(toggle);

        expect(screen.getAllByText('[+]')).toHaveLength(1);
        expect(subtree()).toHaveAttribute('hidden');
    });

    it('renders a placeholder for deleted comments', () => {
        renderComment(comment({ deleted: true }));

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByText('Top level')).not.toBeInTheDocument();
    });
});
