import { NavLink } from 'react-router-dom';

import Settings from '@/components/Settings/Settings';
import { useSettings } from '@/context/SettingsContext';

import styles from './Header.module.scss';

const NAV_LINKS: Array<{ to: string; label: string }> = [
  { to: '/newest/1', label: 'new' },
  { to: '/show/1', label: 'show' },
  { to: '/ask/1', label: 'ask' },
  { to: '/jobs/1', label: 'jobs' },
];

export default function Header() {
  const { settings, toggleSettings } = useSettings();

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? styles.active : undefined;

  return (
    <header>
      <div id="header">
        <NavLink
          to="/news/1"
          className={({ isActive }) =>
            [styles['home-link'], isActive ? styles.active : '']
              .filter(Boolean)
              .join(' ')
          }
          onClick={scrollTop}
        >
          <div className="logo-inner"></div>
          <img className={styles.logo} src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className={styles['header-text']}>
          <div className={styles.left}>
            <span className={styles['header-nav']}>
              {NAV_LINKS.map(({ to, label }, index) => (
                <span key={to}>
                  {index > 0 && ' | '}
                  <NavLink to={to} className={navClass} onClick={scrollTop}>
                    {label}
                  </NavLink>
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <img
            className="settings"
            src="/assets/images/cog.svg"
            alt="Settings"
            onClick={toggleSettings}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
