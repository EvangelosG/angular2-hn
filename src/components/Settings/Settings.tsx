import { useSettings } from '../../context/SettingsContext';
import './Settings.scss';

export function Settings() {
  const { settings, dispatch } = useSettings();

  const closeSettings = () => dispatch({ type: 'TOGGLE_SETTINGS' });
  const toggleOpenLinksInNewTab = () => dispatch({ type: 'TOGGLE_OPEN_LINKS_IN_NEW_TAB' });
  const selectTheme = (theme: string) => dispatch({ type: 'SET_THEME', payload: theme });
  const changeTitleFont = (val: string) => dispatch({ type: 'SET_FONT', payload: val });
  const changeSpacing = (val: string) => dispatch({ type: 'SET_SPACING', payload: val });

  return (
    <div className="settings-wrapper">
      <div className="overlay">
        <div className="popup">
          <h1>Settings</h1>
          <hr />
          <span className="close" onClick={closeSettings}>&times;</span>
          <div className="content">
            <div className="control-section">
              <h2>Links</h2>
              <label>
                <input
                  type="checkbox"
                  checked={settings.openLinkInNewTab}
                  onChange={toggleOpenLinksInNewTab}
                />
                {' '}Open links in a new tab
              </label>
            </div>
            <div className="theme-controls">
              <div className="control-section">
                <h2>Select a theme</h2>
                <div>
                  <label>
                    <input
                      name="theme"
                      type="radio"
                      value="default"
                      checked={settings.theme === 'default'}
                      onChange={() => selectTheme('default')}
                    />
                    {' '}Default
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      name="theme"
                      type="radio"
                      value="night"
                      checked={settings.theme === 'night'}
                      onChange={() => selectTheme('night')}
                    />
                    {' '}Night
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      name="theme"
                      type="radio"
                      value="amoledblack"
                      checked={settings.theme === 'amoledblack'}
                      onChange={() => selectTheme('amoledblack')}
                    />
                    {' '}Black (AMOLED)
                  </label>
                </div>
              </div>
              <div className="control-section">
                <h2>Change Font</h2>
                <div>
                  <label>
                    Font size:
                    <input
                      min="1"
                      value={settings.titleFontSize}
                      type="number"
                      onChange={(e) => changeTitleFont(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    List spacing:
                    <input
                      min="0"
                      value={settings.listSpacing}
                      type="number"
                      onChange={(e) => changeSpacing(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
