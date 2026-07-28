import { Link, useLocation } from 'react-router-dom';

import { Settings } from '../Settings/Settings';
import { useSettings } from '../../hooks/useSettings';
import './Header.scss';

const feeds = [
  { path: 'newest', label: 'new' },
  { path: 'show', label: 'show' },
  { path: 'ask', label: 'ask' },
  { path: 'jobs', label: 'jobs' },
];

function scrollTop() {
  window.scrollTo(0, 0);
}

export function Header() {
  const { settings, toggleSettings } = useSettings();
  const { pathname } = useLocation();

  const linkClass = (feed: string) => (pathname.startsWith(`/${feed}`) ? 'active' : undefined);

  return (
    <header>
      <div id="header">
        <Link className={`home-link ${linkClass('news') ?? ''}`} to="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </Link>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              {feeds.map((feed, index) => (
                <span key={feed.path}>
                  {index > 0 && ' | '}
                  <Link className={linkClass(feed.path)} to={`/${feed.path}/1`} onClick={scrollTop}>
                    {feed.label}
                  </Link>
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="info">
          <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
