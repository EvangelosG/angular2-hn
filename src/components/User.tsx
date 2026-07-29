import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../api/hnApi';
import { User as UserModel } from '../models/user';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

import './User.scss';

export default function User() {
    const { id } = useParams<'id'>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        if (!id) {
            return;
        }

        fetchUser(id).then(
            data => {
                if (!cancelled) {
                    setUser(data);
                }
            },
            () => {
                if (!cancelled) {
                    setErrorMessage(`Could not load user ${id}.`);
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <>
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
        </>
    );
}
