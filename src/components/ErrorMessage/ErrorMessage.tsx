import { cx } from '../../utils/cx';
import styles from './ErrorMessage.module.scss';

export interface ErrorMessageProps {
    message: string;
}

/** Port of Angular's <app-error-message>. Plain class names are kept for the global theme rules. */
export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className={cx(styles.errorSection, 'error-section')}>
            <div className={cx(styles.skull, 'skull')}>
                <div className={cx(styles.head, 'head')}>
                    <div className={cx(styles.crack, 'crack')}></div>
                </div>
                <div className={cx(styles.mouth, 'mouth')}>
                    <div className={cx(styles.teeth, 'teeth')}></div>
                </div>
            </div>
            <p className={styles.strong}>{message}</p>
            <p>
                If you are offline viewing, you&apos;ll need to visit this page with a network connection first before it
                can work offline.
            </p>
        </div>
    );
}
