import React, { useEffect, useMemo, useState } from 'react';

const ProfilePanel = ({
  isOpen,
  profile,
  plantCount,
  loading,
  error,
  onClose,
  onSave,
  onDeleteAccount,
}) => {
  const [displayName, setDisplayName] = useState(profile?.firstName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.firstName || '');
    setEmail(profile?.email || '');
  }, [profile]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const initials = useMemo(() => {
    const source = displayName || profile?.username || 'U';
    return source.slice(0, 2).toUpperCase();
  }, [displayName, profile?.username]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = await onSave({
      firstName: displayName.trim(),
      email: email.trim(),
    });

    if (saved) {
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className={`profile-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`profile-panel ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <div className="sheet-header">
          <button className="icon-text-button" type="button" onClick={onClose}>Back</button>
          <h2>Profile</h2>
          <button
            className="text-button"
            type="button"
            onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="profile-content">
          <div className="avatar-block">
            <div className="avatar-circle">{initials}</div>
            <p className="profile-handle">@{profile?.username || 'gardener'}</p>
            <p className="profile-tagline">
              {displayName ? `Welcome back, ${displayName}.` : 'Keep your sanctuary in sync.'}
            </p>
          </div>

          <div className="stats-card">
            <span className="stats-value">{plantCount}</span>
            <span className="stats-label">Plants</span>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <section className="profile-section">
              <p className="section-label">PERSONAL INFO</p>

              <label className="profile-field">
                <span>Display name</span>
                {isEditing ? (
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name" />
                ) : (
                  <strong>{displayName || 'Your name'}</strong>
                )}
              </label>

              <label className="profile-field">
                <span>Email</span>
                {isEditing ? (
                  <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" />
                ) : (
                  <strong>{email || 'your@email.com'}</strong>
                )}
              </label>

              <label className="profile-field">
                <span>Username</span>
                <strong>{profile?.username || 'username'}</strong>
              </label>
            </section>

            <section className="profile-section">
              <p className="section-label">ACCOUNT</p>
              <button className="danger-button" type="button" onClick={onDeleteAccount} disabled={loading}>
                Delete account
              </button>
            </section>

            {error ? <p className="form-message error">{error}</p> : null}
          </form>
        </div>
      </aside>
    </>
  );
};

export default ProfilePanel;
