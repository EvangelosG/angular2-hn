import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchUser } from '../../api/hackerNewsApi';
import { SettingsProvider } from '../../settings';
import { makeUser } from '../../test/fixtures';
import { LocationDisplay, renderWithProviders } from '../../test/renderWithProviders';
import { UserPage } from './UserPage';

vi.mock('../../api/hackerNewsApi', async (orig) => ({
    ...(await orig<typeof import('../../api/hackerNewsApi')>()),
    fetchUser: vi.fn(),
}));

function renderUser(route = '/user/pg') {
    return renderWithProviders(<UserPage />, { route, path: '/user/:id' });
}

describe('UserPage', () => {
    beforeEach(() => {
        vi.mocked(fetchUser).mockReset();
    });

    it('shows the loader while the user is loading', () => {
        vi.mocked(fetchUser).mockReturnValue(new Promise(() => {}));
        const { container } = renderUser();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(container.querySelector('.profile')).toBeNull();
        expect(fetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
    });

    it('renders the profile on success', async () => {
        vi.mocked(fetchUser).mockResolvedValue(
            makeUser({ id: 'pg', karma: 155000, created: '18 years ago', about: 'Bug <i>fixer</i>.' })
        );
        const { container } = renderUser();

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(container.querySelector('.main-details .name')).toHaveTextContent(/^pg$/);
        expect(container.querySelector('.main-details .right')).toHaveTextContent('155000 ★');
        expect(screen.getByText('Created 18 years ago')).toHaveClass('age');
        expect(container.querySelector('.item-header')).toHaveClass('mobile');
        const about = container.querySelector('.otherDetails > p');
        expect(about?.innerHTML).toBe('Bug <i>fixer</i>.');
        expect(screen.getByText('fixer').tagName).toBe('I');
    });

    it('omits the about section when the user has no about', async () => {
        vi.mocked(fetchUser).mockResolvedValue(makeUser({ about: undefined }));
        const { container } = renderUser();
        await screen.findByText('Profile: pg');
        expect(container.querySelector('.otherDetails')).toBeNull();
    });

    it('shows the Angular error message when the fetch fails', async () => {
        vi.mocked(fetchUser).mockRejectedValue(new Error('404'));
        const { container } = renderUser('/user/someone');
        expect(await screen.findByText('Could not load user someone.')).toBeInTheDocument();
        expect(container.querySelector('.error-section')).not.toBeNull();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(container.querySelector('.profile')).toBeNull();
    });

    it('ignores aborted requests', async () => {
        vi.mocked(fetchUser).mockImplementation(
            (_id, signal) =>
                new Promise((_resolve, reject) => {
                    signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
                })
        );
        const { unmount } = renderUser();
        const signal = vi.mocked(fetchUser).mock.calls[0][1];
        unmount();
        expect(signal?.aborted).toBe(true);
    });

    it('goes back when the back button is clicked', async () => {
        vi.mocked(fetchUser).mockResolvedValue(makeUser());
        const user = userEvent.setup();
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/news/1', '/user/pg']} initialIndex={1}>
                    <Routes>
                        <Route path="/user/:id" element={<UserPage />} />
                        <Route path="*" element={<LocationDisplay />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );
        await screen.findByText('Profile: pg');
        await user.click(screen.getByRole('button', { name: 'Back' }));
        expect(await screen.findByTestId('location')).toHaveTextContent('/news/1');
    });

    it('refetches when the id changes', async () => {
        vi.mocked(fetchUser).mockImplementation((id) => Promise.resolve(makeUser({ id, karma: id.length })));
        function GoToDang() {
            const navigate = useNavigate();
            return <button onClick={() => navigate('/user/dang')}>go</button>;
        }
        const { user } = renderWithProviders(
            <>
                <GoToDang />
                <UserPage />
            </>,
            { route: '/user/pg', path: '/user/:id' }
        );
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'go' }));
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
        expect(screen.queryByText('Profile: pg')).not.toBeInTheDocument();
        expect(fetchUser).toHaveBeenCalledTimes(2);
        expect(fetchUser).toHaveBeenLastCalledWith('dang', expect.any(AbortSignal));
    });
});
