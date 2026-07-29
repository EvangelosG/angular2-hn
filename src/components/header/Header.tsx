import { NavLink } from 'react-router-dom';

import { useSettings } from '../../context/useSettings';
import { SettingsPopup } from '../settings/Settings';
import './Header.scss';

const feeds = ['newest', 'show', 'ask', 'jobs'];

function scrollTop() {
    window.scrollTo(0, 0);
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header>
            <div id="header">
                <NavLink
                    className={({ isActive }) => (isActive ? 'home-link active' : 'home-link')}
                    to="/news/1"
                    onClick={scrollTop}
                >
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {feeds.map((feed, index) => (
                                <span key={feed}>
                                    {index > 0 && ' | '}
                                    <NavLink
                                        className={({ isActive }) => (isActive ? 'active' : '')}
                                        to={`/${feed}/1`}
                                        onClick={scrollTop}
                                    >
                                        {feed === 'newest' ? 'new' : feed}
                                    </NavLink>
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            {settings.showSettings && <SettingsPopup />}
        </header>
    );
}
