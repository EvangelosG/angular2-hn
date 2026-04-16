import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Comment from '../components/Comment';
import type { Comment as CommentType } from '../types/comment';

const mockComment: CommentType = {
  id: 1,
  level: 0,
  user: 'testuser',
  time: 1234567890,
  time_ago: '2 hours ago',
  content: '<p>This is a test comment</p>',
  deleted: false,
  comments: [],
};

const deletedComment: CommentType = {
  ...mockComment,
  id: 2,
  deleted: true,
};

describe('Comment', () => {
  it('renders comment user and time', () => {
    render(
      <MemoryRouter>
        <Comment comment={mockComment} />
      </MemoryRouter>
    );
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('renders deleted comment', () => {
    render(
      <MemoryRouter>
        <Comment comment={deletedComment} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
  });

  it('toggles collapse on click', () => {
    render(
      <MemoryRouter>
        <Comment comment={mockComment} />
      </MemoryRouter>
    );
    const collapseBtn = screen.getByText('[-]');
    fireEvent.click(collapseBtn);
    expect(screen.getByText('[+]')).toBeInTheDocument();
  });
});
