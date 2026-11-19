import { cx } from '../../utils/cx';
import styles from './Loader.module.scss';

export function Loader() {
    return (
        <div className={cx('loading-section', styles.loadingSection)} role="status" aria-live="polite">
            <div className={cx('loader', styles.loader)}>Loading...</div>
        </div>
    );
}
