import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/ErrorMessage/ErrorMessage';
import { Loader } from '../shared/Loader/Loader';
import { fetchUser } from '../../api/hackernews';
import { useHackerNews } from '../../hooks/useHackerNews';
import './User.scss';

export function User() {
  const { id } = useParams();
  const navigate = useNavigate();

  const request = useCallback((signal: AbortSignal) => fetchUser(id!, signal), [id]);
  const { data: user, errorMessage } = useHackerNews(request, `Could not load user ${id}.`);

  const goBack = () => navigate(-1);

  return (
    <>
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

export default User;
