import type { Theme } from '../models';
import { useSettings } from '../settings';
import { cx } from '../utils/cx';
import styles from './Settings.module.scss';

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

/** Port of Angular's core/settings popup. */
export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setTitleFontSize, setListSpacing } =
        useSettings();

    return (
        <div id="popup1" className={styles.overlay}>
            <div className={cx(styles.popup, 'popup')}>
                <h1>Settings</h1>
                <hr />
                <span className={styles.close} onClick={toggleSettings}>
                    &times;
                </span>
                <div className={styles.content}>
                    <div className={styles.controlSection}>
                        <h2>Links</h2>
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.openLinkInNewTab}
                                onChange={toggleOpenLinksInNewTab}
                            />{' '}
                            Open links in a new tab
                        </label>
                    </div>
                    <div>
                        <div className={styles.controlSection}>
                            <h2>Select a theme</h2>
                            {THEME_OPTIONS.map(({ value, label }) => (
                                <div key={value}>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value={value}
                                            checked={settings.theme === value}
                                            onChange={() => setTheme(value)}
                                        />{' '}
                                        {label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className={styles.controlSection}>
                            <h2>Change Font</h2>
                            <div>
                                <label>
                                    Font size:
                                    <input
                                        min="1"
                                        type="number"
                                        value={settings.titleFontSize}
                                        onChange={(event) => setTitleFontSize(event.target.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        type="number"
                                        value={settings.listSpacing}
                                        onChange={(event) => setListSpacing(event.target.value)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
