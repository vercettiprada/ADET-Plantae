import React from 'react';

const SettingsSidebar = ({
  isOpen,
  onClose,
  onAboutClick,
  onProfileClick,
  onLogout,
  isDarkMode,
  setIsDarkMode,
}) => (
  <>
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />

    <nav className={`side-settings ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Settings</h2>
        <button className="close-x-apple" type="button" onClick={onClose}>x</button>
      </div>

      <div className="settings-menu">
        <div className="menu-group">
          <button className="menu-item-button" type="button" onClick={onProfileClick}>Profile</button>
          <button className="menu-item-button" type="button" onClick={onProfileClick}>Account Settings</button>
          <label className="toggle-row">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(event) => setIsDarkMode(event.target.checked)}
            />
          </label>
          <button className="menu-item-button" type="button" onClick={onAboutClick}>About Plantae</button>
          <button className="menu-item-button logout-text" type="button" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </nav>
  </>
);

export default SettingsSidebar;
