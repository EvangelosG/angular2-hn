import type { ChangeEvent, KeyboardEvent } from 'react';

import type { Theme } from '../../models';
import { useSettings } from '../../settings';
import { cx } from '../../utils';
import styles from './Settings.module.scss';

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    const onCloseKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSettings();
        }
    };

    return (
        <div id="popup1" className={cx('overlay', styles.overlay)}>
            <div className={cx('popup', styles.popup)} role="dialog" aria-labelledby="settings-title">
                <h1 id="settings-title">Settings</h1>
                <hr />
                <span
                    className={cx('close', styles.close)}
                    role="button"
                    tabIndex={0}
                    aria-label="Close settings"
                    onClick={toggleSettings}
                    onKeyDown={onCloseKeyDown}
                >
                    &times;
                </span>
                <div className={cx('content', styles.content)}>
                    <div className={cx('control-section', styles.controlSection)}>
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
                    <div className="theme-controls">
                        <div className={cx('control-section', styles.controlSection)}>
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
                        <div className={cx('control-section', styles.controlSection)}>
                            <h2>Change Font</h2>
                            <div>
                                <label>
                                    Font size:
                                    <input
                                        min="1"
                                        name="titleFontSize"
                                        type="number"
                                        value={settings.titleFontSize}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                            setFont(event.target.value)
                                        }
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        name="listSpacing"
                                        type="number"
                                        value={settings.listSpacing}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                            setSpacing(event.target.value)
                                        }
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
