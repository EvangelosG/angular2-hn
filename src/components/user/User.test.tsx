import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../hooks/useHackerNewsApi';
import type { User as UserModel } from '../../models';
import User from './User';

function makeUser(overrides: Partial<UserModel> = {}): UserModel {
    return {
        id: 'alice',
        crated_time: 1700000000,
        created: 'Jan 1, 2020',
        karma: 1234,
        avg: 4.2,
        about: '<p>About Alice</p>',
        ...overrides,
    };
}

function renderUser(userId: string = 'alice') {
    return render(
        <MemoryRouter initialEntries={[`/user/${userId}`]}>
            <Routes>
                <Route path="/user/:id" element={<User />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('User', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('renders Loader and then the user content', async () => {
        const fetchSpy = vi.spyOn(api, 'fetchUser').mockResolvedValue(makeUser());
        renderUser('alice');

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByText('alice').length).toBeGreaterThan(0);
        });
        expect(screen.getByText(/1234/)).toBeInTheDocument();
        expect(screen.getByText(/Created Jan 1, 2020/)).toBeInTheDocument();
        expect(screen.getByText('About Alice')).toBeInTheDocument();
        expect(fetchSpy).toHaveBeenCalledWith('alice');
    });

    it('renders the ErrorMessage on a fetch error', async () => {
        vi.spyOn(api, 'fetchUser').mockRejectedValue(new Error('nope'));
        renderUser('alice');

        await waitFor(() => {
            expect(screen.getByText(/could not load user alice/i)).toBeInTheDocument();
        });
    });
});
