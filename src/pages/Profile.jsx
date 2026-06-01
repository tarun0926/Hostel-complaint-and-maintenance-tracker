import React, { useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Home, Save, CheckCircle2, Edit2, X } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [room, setRoom] = useState(user?.room || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate updating user profile
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      setIsEditing(false);
      
      // Update local storage directly for demo persistence since we don't have a backend
      const updatedUser = { ...user, name, room };
      localStorage.setItem('hostel_user', JSON.stringify(updatedUser));
      
      // We would ideally have an updateProfile function in AuthContext, 
      // but for this MVP, a page reload after a short delay will resync the context.
      setTimeout(() => {
        setIsSuccess(false);
        window.location.reload();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="profile-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="text-muted">Manage your personal information and preferences.</p>
      </div>

      <div className="profile-content">
        <Card className="profile-card">
          <div className="profile-header-visual">
            <div className="profile-avatar large-avatar glass">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-title-info">
              <h2>{name}</h2>
              <span className="badge badge-in-progress">{user?.role === 'admin' ? 'Administrator' : 'Student'}</span>
            </div>
          </div>

          {isSuccess && (
            <div className="auth-error" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderColor: 'rgba(34, 197, 94, 0.2)', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Profile updated successfully! Refreshing...</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="profile-form">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Personal Information</h3>
              {!isEditing ? (
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setName(user?.name || ''); setRoom(user?.room || ''); }}>
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className={`auth-input-wrapper ${!isEditing ? 'disabled-wrapper' : ''}`}>
                <User size={18} className="auth-icon" />
                <input 
                  type="text" 
                  className="input-field icon-padding" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address (Read-only)</label>
              <div className="auth-input-wrapper disabled-wrapper">
                <Mail size={18} className="auth-icon" />
                <input 
                  type="email" 
                  className="input-field icon-padding" 
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            {user?.role !== 'admin' && (
              <div className="input-group">
                <label className="input-label">Enrollment Number (Read-only)</label>
                <div className="auth-input-wrapper disabled-wrapper">
                  <User size={18} className="auth-icon" />
                  <input 
                    type="text" 
                    className="input-field icon-padding" 
                    value={user?.enrollment || 'N/A'}
                    disabled
                  />
                </div>
              </div>
            )}

            {user?.role !== 'admin' && (
              <div className="input-group">
                <label className="input-label">Room Number</label>
                <div className={`auth-input-wrapper ${!isEditing ? 'disabled-wrapper' : ''}`}>
                  <Home size={18} className="auth-icon" />
                  <input 
                    type="text" 
                    className="input-field icon-padding" 
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    disabled={!isEditing}
                    required 
                  />
                </div>
              </div>
            )}

            {isEditing && (
              <div className="form-actions mt-4">
                <button type="submit" className="btn btn-primary" disabled={isSaving || isSuccess}>
                  {isSaving ? 'Saving...' : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
