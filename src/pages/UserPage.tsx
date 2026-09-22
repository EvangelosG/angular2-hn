import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../api/hackernews';
import { ErrorMessage, Loader } from '../components/shared';
import type { User } from '../models';
import './user-page.scss';

export default function UserPage() {
    const { id } = useParams<'id'>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) {
            return;
        }

        const controller = new AbortController();
        setUser(null);
        setErrorMessage('');

        fetchUser(id, controller.signal)
            .then(data => setUser(data))
            .catch(error => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage(`Could not load user ${id}.`);
            });

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (!user) {
            return;
        }
        const previousTitle = document.title;
        document.title = `Profile: ${user.id} | Angular HNPWA`;
        return () => {
            document.title = previousTitle;
        };
    }, [user]);

    if (!user) {
        return errorMessage === '' ? <Loader /> : <ErrorMessage message={errorMessage} />;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" onClick={() => navigate(-1)} />
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
            <div className="profile-links">
                <a href={`https://news.ycombinator.com/submitted?id=${user.id}`} target="_blank" rel="noopener noreferrer">
                    submissions
                </a>
                <a href={`https://news.ycombinator.com/threads?id=${user.id}`} target="_blank" rel="noopener noreferrer">
                    comments
                </a>
            </div>
        </div>
    );
}
