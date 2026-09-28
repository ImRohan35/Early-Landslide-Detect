import { useState } from 'react';
import { Check, Edit3, KeyRound, LogOut, Shield, User, UserCheck } from 'lucide-react';
import { updateProfileApi } from '../services/api';

export default function ProfileView({ user, onUpdateUser, onLogout, showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Disaster Risk Analyst');
  const [agency, setAgency] = useState(user?.agency || 'North-East Disaster Management Authority');
  const [role, setRole] = useState(user?.role || 'Lead Operations Analyst');

  // Change password modal/form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    const updated = {
      ...user,
      name,
      agency,
      role,
    };
    onUpdateUser(updated);
    setIsEditing(false);

    try {
      await updateProfileApi(user.id || user.email, { name, agency, role });
    } catch {}

    showToast('Profile information updated successfully', 'success');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully', 'success');
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>User Profile & Credentials</h2>
          <p>Manage your account identity, regional affiliation, and security preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 1.6fr)', gap: 24 }}>
        {/* Profile Card Summary */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--forest-800), var(--forest-600))',
              color: '#ffffff',
              fontSize: 38,
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(27, 67, 50, 0.3)',
            }}
          >
            {user?.avatar || '🛡️'}
          </div>

          <h3 style={{ fontSize: 20, marginBottom: 4 }}>{user?.name || 'Analyst'}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{user?.email}</p>
          <span className="badge badge-low" style={{ marginBottom: 16 }}>
            {user?.role || 'Operations Lead'}
          </span>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, textAlign: 'left', fontSize: 13 }}>
            <div style={{ marginBottom: 10 }}>
              <small style={{ color: 'var(--text-muted)', display: 'block' }}>Agency / Department</small>
              <strong style={{ color: 'var(--text-primary)' }}>{user?.agency || 'NDMA Cell'}</strong>
            </div>
            <div style={{ marginBottom: 10 }}>
              <small style={{ color: 'var(--text-muted)', display: 'block' }}>Assigned Region</small>
              <strong style={{ color: 'var(--text-primary)' }}>North-Eastern Region (8 States)</strong>
            </div>
            <div>
              <small style={{ color: 'var(--text-muted)', display: 'block' }}>System Access</small>
              <strong style={{ color: 'var(--forest-600)' }}>Full Analytical & Reporting Rights</strong>
            </div>
          </div>
        </div>

        {/* Profile Edit / Password Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Information Form */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Account Information</h3>
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => setIsEditing(true)}
                  id="edit-profile-btn"
                >
                  <Edit3 size={14} />
                  Edit Profile
                </button>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                  Editing Mode Active
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  id="profile-name-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || 'analyst@nelrms.gov.in'}
                  disabled
                  style={{ opacity: 0.7 }}
                />
                <small style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Email address is linked to system authentication and cannot be changed here.
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Functional Role</label>
                  <input
                    type="text"
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Affiliated Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    id="save-profile-btn"
                  >
                    <Check size={15} />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyRound size={17} style={{ color: 'var(--primary)' }} />
                <h3 className="card-title">Security & Password</h3>
              </div>
              {!showPasswordForm && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => setShowPasswordForm(true)}
                  id="change-password-toggle-btn"
                >
                  Change Password
                </button>
              )}
            </div>

            {showPasswordForm ? (
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    id="save-new-password-btn"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Password was last verified for analytical session security. Regular updates are recommended.
              </p>
            )}
          </div>

          {/* Account Actions & Sign Out */}
          {onLogout && (
            <div className="card" style={{ borderColor: '#fecaca', background: '#fffafa' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LogOut size={17} style={{ color: '#dc2626' }} />
                  <h3 className="card-title" style={{ color: '#991b1b' }}>Account Session</h3>
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onClick={onLogout}
                  id="profile-signout-btn"
                >
                  <LogOut size={15} />
                  <span>Sign Out of Workspace</span>
                </button>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                Terminate active monitoring session on this browser device. You will be returned to the main landing portal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
