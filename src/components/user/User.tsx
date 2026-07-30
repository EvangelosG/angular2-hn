import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackerNews';
import { User as UserModel } from '../../types';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import './User.scss';

export default function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserModel | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setUser(null);
    setErrorMessage('');

    fetchUser(id as string)
      .then(data => {
        if (!cancelled) {
          setUser(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Could not load user ' + id + '.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const goBack = () => navigate(-1);

  return (
    <div className="user-view">
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
              <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
