import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Comment } from './Comment';
import type { Comment as CommentModel } from '../../models/comment';

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
  it('renders nested comments recursively', () => {
    renderComment(
      buildComment({
        comments: [buildComment({ id: 2, user: 'kate', content: '<p>child</p>' })],
      })
    );

    expect(screen.getByText('parent')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'kate' })).toHaveAttribute('href', '/user/kate');
  });

  it('collapses and expands the comment tree', async () => {
    renderComment(buildComment());

    const toggle = screen.getByText('[-]');
    await userEvent.click(toggle);

    expect(screen.getByText('[+]')).toBeInTheDocument();
    expect(screen.getByText('parent').closest('div[hidden]')).not.toBeNull();

    await userEvent.click(screen.getByText('[+]'));
    expect(screen.getByText('parent').closest('div[hidden]')).toBeNull();
  });

  it('renders a placeholder for deleted comments', () => {
    renderComment(buildComment({ deleted: true, content: '<p>gone</p>' }));

    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.queryByText('gone')).not.toBeInTheDocument();
  });
});
