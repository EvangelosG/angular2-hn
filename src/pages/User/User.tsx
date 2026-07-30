import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import { fetchUser } from '../../api/hackernews';
import { User as UserModel } from '../../models/user';
import './User.scss';

interface UserState {
    key: string;
    user: UserModel | null;
    error: string;
}

export default function User() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [state, setState] = useState<UserState>({ key: '', user: null, error: '' });

    useEffect(() => {
        const controller = new AbortController();

        fetchUser(id as string, controller.signal)
            .then((user) => setState({ key: id as string, user, error: '' }))
            .catch(() => {
                if (!controller.signal.aborted) {
                    setState({ key: id as string, user: null, error: `Could not load user ${id}.` });
                }
            });

        return () => controller.abort();
    }, [id]);

    const user = state.key === id ? state.user : null;
    const errorMessage = state.key === id ? state.error : '';

    return (
        <div className="app-user">
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{user.karma} ★</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
