import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loader from '@/components/Loader/Loader';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import { fetchUser } from '@/services/hackerNewsApi';
import type { User as UserModel } from '@/models/user';

import styles from './User.module.scss';

export interface UserProps {
  /** User id; falls back to the `:id` route param. */
  userId?: string;
}

export default function User({ userId }: UserProps) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = userId ?? params.id;

  const [user, setUser] = useState<UserModel | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setUser(null);
    setErrorMessage('');

    if (!id) {
      return;
    }

    fetchUser(id)
      .then((data) => {
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

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {user && (
        <div className={styles.profile}>
          <div className={`${styles.mobile} item-header`}>
            <p className={styles['title-block']}>
              <span className="back-button" onClick={goBack}></span>
              Profile: {user.id}
            </p>
          </div>
          <div className="main-details">
            <span className="name">{user.id}</span>
            <span className="right">{user.karma} ★</span>
            <p className={styles.age}>Created {user.created}</p>
          </div>
          {user.about && (
            <div className={styles['other-details']}>
              <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
