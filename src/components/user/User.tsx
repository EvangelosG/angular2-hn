import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../hooks/useHackerNewsApi';
import type { User as UserModel } from '../../models';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';

function User() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserModel | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setErrorMessage('Could not load user.');
            return;
        }
        let ignored = false;
        setLoading(true);
        setUser(null);
        setErrorMessage(null);

        fetchUser(id)
            .then((data) => {
                if (ignored) return;
                setUser(data);
            })
            .catch(() => {
                if (ignored) return;
                setErrorMessage(`Could not load user ${id}.`);
            })
            .finally(() => {
                if (ignored) return;
                setLoading(false);
            });

        return () => {
            ignored = true;
        };
    }, [id]);

    const goBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <Loader />;
    }

    if (errorMessage) {
        return <ErrorMessage message={errorMessage} />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <button
                        type="button"
                        className="back-button"
                        onClick={goBack}
                        aria-label="Go back"
                    />
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
                    <p dangerouslySetInnerHTML={{ __html: user.about }} />
                </div>
            )}
        </div>
    );
}

export default User;
