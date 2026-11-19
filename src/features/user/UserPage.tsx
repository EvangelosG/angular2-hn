import { useEffect, useState, type KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackerNewsApi';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { User } from '../../models';
import { cx } from '../../utils';
import styles from './UserPage.module.scss';

type UserState = { id: string; user: User } | { id: string; errorMessage: string };

export function UserPage() {
    const { id = '' } = useParams<'id'>();
    const navigate = useNavigate();
    const [state, setState] = useState<UserState | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetchUser(id, { signal: controller.signal })
            .then((user) => setState({ id, user }))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setState({ id, errorMessage: 'Could not load user ' + id + '.' });
            });
        return () => controller.abort();
    }, [id]);

    const current = state?.id === id ? state : null;

    if (!current) {
        return <Loader />;
    }
    if ('errorMessage' in current) {
        return <ErrorMessage message={current.errorMessage} />;
    }

    const { user } = current;
    const goBack = () => navigate(-1);
    const onBackKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    };

    return (
        <div className={cx('profile', styles.profile)}>
            <div className={cx('mobile', 'item-header', styles.mobile, styles.itemHeader)}>
                <p className={cx('title-block', styles.titleBlock)}>
                    <span
                        className={cx('back-button', styles.backButton)}
                        role="button"
                        tabIndex={0}
                        aria-label="Back"
                        onClick={goBack}
                        onKeyDown={onBackKeyDown}
                    />
                    Profile: {user.id}
                </p>
            </div>
            <div className={cx('main-details', styles.mainDetails)}>
                <span className={cx('name', styles.name)}>{user.id}</span>
                <span className={cx('right', styles.right)}>{user.karma} ★</span>
                <p className={cx('age', styles.age)}>Created {user.created}</p>
            </div>
            {user.about && (
                <div className={cx('other-details', styles.otherDetails)}>
                    <p dangerouslySetInnerHTML={{ __html: user.about }} />
                </div>
            )}
        </div>
    );
}

export default UserPage;
