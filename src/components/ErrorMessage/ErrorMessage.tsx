import { cx } from '../../utils/cx';
import styles from './ErrorMessage.module.scss';

export interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className={cx('error-section', styles.errorSection)} role="alert">
            <div className={cx('skull', styles.skull)} aria-hidden="true">
                <div className={cx('head', styles.head)}>
                    <div className={cx('crack', styles.crack)} />
                </div>
                <div className={cx('mouth', styles.mouth)}>
                    <div className={cx('teeth', styles.teeth)} />
                </div>
            </div>
            <p className={cx('strong', styles.strong)}>{message}</p>
            <p>
                If you are offline viewing, you&apos;ll need to visit this page with a network connection first before
                it can work offline.
            </p>
        </div>
    );
}
