import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserType } from '../../types/user';
import { fetchUser } from '../../services/hackernews-api';
import { sanitizeHtml } from '../../utils/sanitize';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './User.scss';

export function User() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setUser(null);
        setErrorMessage('');

        if (id) {
            fetchUser(id)
                .then((data) => {
                    if (!cancelled) setUser(data);
                })
                .catch(() => {
                    if (!cancelled) setErrorMessage('Could not load user ' + id + '.');
                });
        }

        return () => {
            cancelled = true;
        };
    }, [id]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="user-wrapper">
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{user.karma} &#9733;</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
