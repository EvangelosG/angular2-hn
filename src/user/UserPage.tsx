import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../shared/api/queries';
import Loader from '../shared/components/Loader';
import ErrorMessage from '../shared/components/ErrorMessage';
import { sanitizeHtml } from '../shared/utils/sanitizeHtml';
import './UserPage.scss';

export default function UserPage() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isError } = useUser(id);

    return (
        <div className="user-page">
            {!user && !isError && <Loader />}
            {!user && isError && <ErrorMessage message={`Could not load user ${id}.`} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span> <span className="right">{user.karma} ★</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={sanitizeHtml(user.about)} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
