import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

import { useSettings } from '../settings';
import { cx } from '../utils/cx';
import styles from './Header.module.scss';
import { Settings } from './Settings';

const NAV_LINKS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
] as const;

function activeClass({ isActive }: { isActive: boolean }) {
    return isActive ? cx(styles.active, 'active') : undefined;
}

function scrollTop() {
    window.scrollTo(0, 0);
}

/** Port of Angular's core/header component. */
export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header>
            <div id="header" className={styles.header}>
                <NavLink
                    to="/news/1"
                    className={({ isActive }) => cx(styles.homeLink, 'home-link', activeClass({ isActive }))}
                    onClick={scrollTop}
                >
                    <div className={cx(styles.logoInner, 'logo-inner')}></div>
                    <img className={styles.logo} src="assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className={styles.headerText}>
                    <div className={styles.left}>
                        <span className={styles.headerNav}>
                            {NAV_LINKS.map(({ to, label }, index) => (
                                <Fragment key={to}>
                                    {index > 0 && ' | '}
                                    <NavLink to={to} className={activeClass} onClick={scrollTop}>
                                        {label}
                                    </NavLink>
                                </Fragment>
                            ))}
                        </span>
                    </div>
                </div>
                <div className={styles.info}>
                    <img src="assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
