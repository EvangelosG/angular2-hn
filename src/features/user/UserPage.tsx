import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser, isAbortError } from '../../api/hackerNewsApi';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { User } from '../../models';
import { cx } from '../../utils/cx';
import styles from './UserPage.module.scss';

type UserResult = { id: string; user: User } | { id: string; errorMessage: string };

/** Port of Angular's user/user.component (/user/:id). */
export function UserPage() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<UserResult | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetchUser(id, controller.signal)
            .then((user) => setResult({ id, user }))
            .catch((error: unknown) => {
                if (!isAbortError(error)) {
                    setResult({ id, errorMessage: 'Could not load user ' + id + '.' });
                }
            });
        return () => controller.abort();
    }, [id]);

    const current = result?.id === id ? result : null;

    if (!current) {
        return <Loader />;
    }
    if ('errorMessage' in current) {
        return <ErrorMessage message={current.errorMessage} />;
    }

    const { user } = current;
    return (
        <div className={styles.profile}>
            <div className={cx(styles.mobile, styles.itemHeader, 'item-header')}>
                <p className={styles.titleBlock}>
                    <span
                        className={cx(styles.backButton, 'back-button')}
                        role="button"
                        aria-label="Back"
                        onClick={() => navigate(-1)}
                    ></span>
                    Profile: {user.id}
                </p>
            </div>
            <div className={cx(styles.mainDetails, 'main-details')}>
                <span className={cx(styles.name, 'name')}>{user.id}</span>
                <span className={cx(styles.right, 'right')}>{user.karma} ★</span>
                <p className={styles.age}>Created {user.created}</p>
            </div>
            {user.about && (
                <div className={styles.otherDetails}>
                    <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                </div>
            )}
        </div>
    );
}
