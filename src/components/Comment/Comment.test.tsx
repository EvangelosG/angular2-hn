import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Comment } from './Comment';
import { Comment as CommentType } from '../../types/comment';

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
  id: 2,
  level: 0,
  user: '',
  time: 0,
  time_ago: '',
  content: '',
  deleted: true,
  comments: [],
};

function renderComment(comment: CommentType) {
  return render(
    <MemoryRouter>
      <Comment comment={comment} />
    </MemoryRouter>
  );
}

describe('Comment', () => {
  it('renders comment content', () => {
    renderComment(mockComment);
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });

  it('renders username and time', () => {
    renderComment(mockComment);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('shows deleted state for deleted comments', () => {
    renderComment(deletedComment);
    expect(screen.getByText('Comment Deleted', { exact: false })).toBeInTheDocument();
  });

  it('collapses and expands on toggle click', () => {
    renderComment(mockComment);
    const toggle = screen.getByText('[-]');
    fireEvent.click(toggle);
    expect(screen.getByText('[+]')).toBeInTheDocument();
    expect(screen.queryByText('This is a test comment')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('[+]'));
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });
});
