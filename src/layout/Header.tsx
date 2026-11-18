import { useSettings } from '../settings';
import { Settings } from './Settings';

// STUB (owned by the layout agent): port of core/header.
export function Header() {
    const { settings, toggleSettings } = useSettings();
    return (
        <header>
            <div id="header">
                <button type="button" onClick={toggleSettings}>
                    Settings
                </button>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
