import { NavLink } from 'react-router-dom';
import { Fragment, type KeyboardEvent } from 'react';

import { useSettings } from '../../settings';
import { cx } from '../../utils';
import { Settings } from '../Settings';
import styles from './Header.module.scss';

const NAV_LINKS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
] as const;

function scrollTop() {
    window.scrollTo(0, 0);
}

function activeClass(baseClass?: string) {
    return ({ isActive }: { isActive: boolean }) => cx(baseClass, isActive && 'active', isActive && styles.active);
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    const onCogKeyDown = (event: KeyboardEvent<HTMLImageElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSettings();
        }
    };

    return (
        <header>
            <div id="header" className={styles.header}>
                <NavLink to="/news/1" className={activeClass(cx('home-link', styles.homeLink))} onClick={scrollTop}>
                    <div className={cx('logo-inner', styles.logoInner)} />
                    <img className={cx('logo', styles.logo)} src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className={cx('header-text', styles.headerText)}>
                    <div className={cx('left', styles.left)}>
                        <span className={cx('header-nav', styles.headerNav)}>
                            {NAV_LINKS.map((link, index) => (
                                <Fragment key={link.to}>
                                    {index > 0 && ' | '}
                                    <NavLink to={link.to} className={activeClass()} onClick={scrollTop}>
                                        {link.label}
                                    </NavLink>
                                </Fragment>
                            ))}
                        </span>
                    </div>
                </div>
                <div className={cx('info', styles.info)}>
                    <img
                        className={cx('settings', styles.settings)}
                        src="/assets/images/cog.svg"
                        alt="Settings"
                        role="button"
                        tabIndex={0}
                        onClick={toggleSettings}
                        onKeyDown={onCogKeyDown}
                    />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
