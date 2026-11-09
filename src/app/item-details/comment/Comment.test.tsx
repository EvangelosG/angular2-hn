import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { makeComment } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/render';
import Comment from './Comment';

describe('Comment', () => {
    const tree = makeComment({
        comments: [
            makeComment({
                id: 101,
                user: 'alice',
                content: 'Reply',
                comments: [makeComment({ id: 102, user: 'bob', content: 'Nested reply' })],
            }),
        ],
    });

    it('renders the comment tree recursively', () => {
        renderWithProviders(<Comment comment={tree} />);
        expect(screen.getByText('Top comment')).toBeInTheDocument();
        expect(screen.getByText('Reply')).toBeInTheDocument();
        expect(screen.getByText('Nested reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
    });

    it('collapses and expands a subtree', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Comment comment={tree} />);

        const [toggle] = screen.getAllByText('[-]');
        await user.click(toggle);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('Nested reply')).not.toBeVisible();

        await user.click(screen.getByText('[+]'));
        expect(screen.getByText('Nested reply')).toBeVisible();
    });

    it('renders deleted comments as a placeholder', () => {
        renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByText('Top comment')).not.toBeInTheDocument();
    });
});
