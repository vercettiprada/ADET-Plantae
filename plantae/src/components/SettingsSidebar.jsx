import React from 'react';

const SettingsSidebar = ({ isOpen, onClose, onAboutClick }) => {
  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      ></div>

      <nav className={`side-settings ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Settings</h2>
          <button className="close-x-apple" onClick={onClose}>✕</button>
        </div>
        
        <div className="settings-menu">
          <div className="menu-group">
              <p>Profile</p>
              <p>Garden Stats</p>
              <p>Dark Mode</p>
              <p>Notifications</p>
              <p>Account Settings</p>
              <p>Help & Support</p>
              
              {/* Added the onClick here */}
              <p onClick={onAboutClick} style={{ cursor: 'pointer' }}>About Plantae</p>
              
              <p className="logout-text">Logout</p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SettingsSidebar;