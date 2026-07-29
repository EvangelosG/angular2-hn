import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../../hooks/useUser';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Loader } from '../Loader/Loader';
import './User.scss';

export function User() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, errorMessage } = useUser(id ?? '');

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

export default User;
