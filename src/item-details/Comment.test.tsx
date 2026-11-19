import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Comment from './Comment';
import { makeComment } from '../test/fixtures';
import { renderWithProviders } from '../test/render';

describe('Comment', () => {
    const tree = makeComment({
        content: '<p>Parent</p>',
        comments: [
            makeComment({ id: 101, user: 'child', content: '<p>Child</p>', comments: [makeComment({ id: 102, user: 'grandchild', content: '<p>Grandchild</p>' })] }),
            makeComment({ id: 103, deleted: true }),
        ],
    });

    it('renders nested replies recursively', () => {
        renderWithProviders(<Comment comment={tree} />);
        expect(screen.getByText('Parent')).toBeInTheDocument();
        expect(screen.getByText('Child')).toBeInTheDocument();
        expect(screen.getByText('Grandchild')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'grandchild' })).toHaveAttribute('href', '/user/grandchild');
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    });

    it('collapses and expands a thread', async () => {
        renderWithProviders(<Comment comment={tree} />);
        const [toggle] = screen.getAllByText('[-]');
        await userEvent.click(toggle);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('Child')).not.toBeVisible();
        await userEvent.click(screen.getByText('[+]'));
        expect(screen.getByText('Child')).toBeVisible();
    });

    it('sanitizes comment html', () => {
        const { container } = renderWithProviders(<Comment comment={makeComment({ content: '<img src=x onerror="alert(1)">hi' })} />);
        expect(container.querySelector('[onerror]')).toBeNull();
    });
});
