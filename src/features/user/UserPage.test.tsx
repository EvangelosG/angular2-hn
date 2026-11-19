import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';

import { ApiError, fetchUser } from '../../api/hackerNewsApi';
import type { User } from '../../models';
import { SettingsProvider } from '../../settings';
import { renderWithProviders, ROUTER_FUTURE_FLAGS } from '../../test/renderWithProviders';
import UserPageDefault from './index';
import { UserPage } from './UserPage';

vi.mock('../../api/hackerNewsApi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../api/hackerNewsApi')>();
    return { ...actual, fetchUser: vi.fn() };
});

const mockedFetchUser = vi.mocked(fetchUser);

const user: User = {
    id: 'pg',
    created_time: 1160418092,
    created: '18 years ago',
    karma: 157316,
    about: 'Bug fixer. <a href="http://paulgraham.com">paulgraham.com</a>',
};

function renderUser(route = '/user/pg') {
    return renderWithProviders(<UserPage />, { route, path: '/user/:id' });
}

describe('UserPage', () => {
    it('exports the page as the module default for React.lazy', () => {
        expect(UserPageDefault).toBe(UserPage);
    });

    it('shows the loader while the user is loading', () => {
        mockedFetchUser.mockReturnValue(new Promise<User>(() => {}));
        const { container } = renderUser();

        expect(container.querySelector('.loader')).not.toBeNull();
        expect(mockedFetchUser).toHaveBeenCalledWith(
            'pg',
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });

    it('renders id, karma, created and about HTML on success', async () => {
        mockedFetchUser.mockResolvedValue(user);
        const { container } = renderUser();

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(container.querySelector('.loader')).toBeNull();

        const details = container.querySelector('.main-details');
        expect(details).not.toBeNull();
        expect(details?.querySelector('.name')).toHaveTextContent('pg');
        expect(details?.querySelector('.right')).toHaveTextContent('157316 ★');
        expect(screen.getByText('Created 18 years ago')).toHaveClass('age');

        const link = screen.getByRole('link', { name: 'paulgraham.com' });
        expect(link).toHaveAttribute('href', 'http://paulgraham.com');
        expect(container.querySelector('.other-details p')?.innerHTML).toBe(user.about);
        expect(container.querySelector('.item-header .back-button')).not.toBeNull();
    });

    it('omits the about section when the user has none', async () => {
        mockedFetchUser.mockResolvedValue({ ...user, about: undefined });
        const { container } = renderUser();

        await screen.findByText('Profile: pg');
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('shows an error message when the request fails', async () => {
        mockedFetchUser.mockRejectedValue(new ApiError(404, 'https://api.hnpwa.com/v0/user/nobody.json'));
        const { container } = renderUser('/user/nobody');

        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('error-section');
        expect(container.querySelector('.loader')).toBeNull();
        expect(container.querySelector('.profile')).toBeNull();
    });

    it('navigates back when the back button is clicked or activated by keyboard', async () => {
        mockedFetchUser.mockResolvedValue(user);
        const routes = (
            <Routes>
                <Route path="/item/:id" element={<p>Item page</p>} />
                <Route path="/user/:id" element={<UserPage />} />
            </Routes>
        );
        const first = render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/item/1', '/user/pg']} initialIndex={1} future={ROUTER_FUTURE_FLAGS}>
                    {routes}
                </MemoryRouter>
            </SettingsProvider>
        );

        fireEvent.click(await screen.findByRole('button', { name: 'Back' }));
        expect(await screen.findByText('Item page')).toBeInTheDocument();
        first.unmount();

        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/item/1', '/user/pg']} initialIndex={1} future={ROUTER_FUTURE_FLAGS}>
                    {routes}
                </MemoryRouter>
            </SettingsProvider>
        );
        fireEvent.keyDown(await screen.findByRole('button', { name: 'Back' }), { key: 'Enter' });
        expect(await screen.findByText('Item page')).toBeInTheDocument();
    });

    it('loads the new user when the route id changes', async () => {
        mockedFetchUser.mockImplementation((id: string) => Promise.resolve({ ...user, id }));
        renderWithProviders(
            <>
                <Link to="/user/dang">dang</Link>
                <Routes>
                    <Route path="/user/:id" element={<UserPage />} />
                </Routes>
            </>,
            { route: '/user/pg' }
        );

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('link', { name: 'dang' }));
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
        expect(mockedFetchUser).toHaveBeenLastCalledWith('dang', expect.anything());
    });

    it('keeps the theme hook class names under the active theme', async () => {
        localStorage.setItem('theme', 'night');
        mockedFetchUser.mockResolvedValue(user);
        const { container } = renderUser();

        await screen.findByText('Profile: pg');
        for (const selector of [
            '.profile',
            '.item-header',
            '.back-button',
            '.main-details .name',
            '.main-details .right',
        ]) {
            expect(container.querySelector(selector)).not.toBeNull();
        }
    });
});
