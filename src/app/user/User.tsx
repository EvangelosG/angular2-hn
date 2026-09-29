import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { User as UserModel } from '../shared/models/user';
import { fetchUser } from '../shared/api/hackernews-api';
import Loader from '../shared/components/loader/Loader';
import ErrorMessage from '../shared/components/error-message/ErrorMessage';
import './User.scss';

export default function User() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let ignore = false;
        fetchUser(id)
            .then((data) => {
                if (!ignore) {
                    setUser(data);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setErrorMessage('Could not load user ' + id + '.');
                }
            });
        return () => {
            ignore = true;
        };
    }, [id]);

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
