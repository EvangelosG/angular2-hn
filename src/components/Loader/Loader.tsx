import { cx } from '../../utils/cx';
import styles from './Loader.module.scss';

/** Port of Angular's <app-loader>. Plain class names are kept for the global theme rules. */
export function Loader() {
    return (
        <div className={cx(styles.loadingSection, 'loading-section')}>
            <div className={cx(styles.loader, 'loader')}>Loading...</div>
        </div>
    );
}
