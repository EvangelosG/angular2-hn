import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeComment } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { Comment } from './Comment';

describe('Comment', () => {
    it('renders the meta line, user link and HTML content', () => {
        renderWithProviders(
            <Comment comment={makeComment({ user: 'dang', time_ago: '3 hours ago', content: '<p>Hello <i>world</i></p>' })} />
        );
        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'dang' })).toHaveAttribute('href', '/user/dang');
        expect(screen.getByText('3 hours ago')).toHaveClass('time');
        expect(screen.getByText('world').tagName).toBe('I');
    });

    it('navigates to the user page from the user link', async () => {
        const { user } = renderWithProviders(<Comment comment={makeComment({ user: 'tptacek' })} />);
        await user.click(screen.getByRole('link', { name: 'tptacek' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/user/tptacek');
    });

    it('renders nested comments recursively', () => {
        const comment = makeComment({
            id: 1,
            user: 'a',
            content: 'parent text',
            comments: [
                makeComment({
                    id: 2,
                    user: 'b',
                    content: 'child text',
                    comments: [makeComment({ id: 3, user: 'c', content: 'grandchild text' })],
                }),
            ],
        });
        renderWithProviders(<Comment comment={comment} />);
        expect(screen.getAllByText('[-]')).toHaveLength(3);
        expect(screen.getByText('grandchild text')).toBeInTheDocument();
        expect(screen.getAllByRole('list')).toHaveLength(3);
    });

    it('collapses and expands the subtree with [-] / [+]', async () => {
        const comment = makeComment({
            id: 1,
            user: 'a',
            content: 'parent text',
            comments: [makeComment({ id: 2, user: 'b', content: 'child text' })],
        });
        const { user, container } = renderWithProviders(<Comment comment={comment} />);
        const meta = container.querySelector('.meta') as HTMLElement;

        await user.click(within(meta).getByText('[-]'));
        expect(within(meta).getByText('[+]')).toBeInTheDocument();
        expect(meta).toHaveClass('metaCollapse');
        expect(screen.getByText('parent text')).not.toBeVisible();
        expect(screen.getByText('child text')).not.toBeVisible();
        // The author line stays visible while collapsed.
        expect(screen.getByRole('link', { name: 'a' })).toBeVisible();

        await user.click(within(meta).getByText('[+]'));
        expect(within(meta).getByText('[-]')).toBeInTheDocument();
        expect(meta).not.toHaveClass('metaCollapse');
        expect(screen.getByText('parent text')).toBeVisible();
        expect(screen.getByText('child text')).toBeVisible();
    });

    it('collapses only the clicked comment', async () => {
        const comment = makeComment({
            id: 1,
            content: 'parent text',
            comments: [makeComment({ id: 2, user: 'b', content: 'child text' })],
        });
        const { user } = renderWithProviders(<Comment comment={comment} />);
        await user.click(screen.getAllByText('[-]')[1]);
        expect(screen.getByText('parent text')).toBeVisible();
        expect(screen.getByText('child text')).not.toBeVisible();
    });

    it('renders the deleted placeholder for deleted comments', () => {
        const { container } = renderWithProviders(
            <Comment comment={makeComment({ deleted: true, user: 'gone', content: 'secret' })} />
        );
        const deleted = container.querySelector('.deleted-meta');
        expect(deleted).toHaveTextContent('[deleted] | Comment Deleted');
        expect(screen.queryByText('secret')).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByText('[-]')).not.toBeInTheDocument();
    });
});
