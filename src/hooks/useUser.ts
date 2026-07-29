import { useEffect, useState } from 'react';

import type { User } from '../models';
import { fetchUser } from '../services/hackerNewsApi';

interface UserState {
    key: string;
    user?: User;
    errorMessage: string;
}

export function useUser(id: string) {
    const [state, setState] = useState<UserState>({ key: id, errorMessage: '' });

    useEffect(() => {
        let cancelled = false;

        fetchUser(id)
            .then((user) => {
                if (!cancelled) {
                    setState({ key: id, user, errorMessage: '' });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setState({ key: id, errorMessage: `Could not load user ${id}.` });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    return state.key === id ? { user: state.user, errorMessage: state.errorMessage } : { errorMessage: '' };
}
