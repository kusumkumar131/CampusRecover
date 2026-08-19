import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Key, CheckCircle, AlertCircle } from 'lucide-react';
import * as userService from '../services/userService';

const Profile = () => {
  const { user, login } = useAuth(); // We can reload user if needed, or update locally

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    department: '',
    year: ''
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        year: user.year || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    if (profileSuccess) setProfileSuccess('');
    if (profileError) setProfileError('');
  };

  const handlePassChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
    if (passSuccess) setPassSuccess('');
    if (passError) setPassError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await userService.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department,
        year: Number(profileData.year) || undefined
      });

      if (response.success) {
        setProfileSuccess('Profile details updated successfully');
        // Let's force reload page or update context (in a larger app we would call checkAuth, but since user updates locally, we are fine)
      } else {
        setProfileError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error occurred while saving profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword !== passData.confirmNewPassword) {
      setPassError('New passwords do not match');
      setPassLoading(false);
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long');
      setPassLoading(false);
      return;
    }

    try {
      const response = await userService.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });

      if (response.success) {
        setPassSuccess('Password updated successfully');
        setPassData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        setPassError(response.message || 'Failed to change password');
      }
    } catch (err) {
      setPassError(err.response?.data?.message || 'Error occurred while updating password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your contact information and passwords.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left Side: General Profile Info */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} style={{ color: 'var(--primary)' }} /> Personal Details
          </h3>

          {profileSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-returned)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <CheckCircle size={16} /> <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--color-lost)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={16} /> <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={profileData.name}
                onChange={handleProfileChange}
                required
                disabled={profileLoading}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '130px', marginBottom: 0 }}>
                <label className="form-label">Student ID (Locked)</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.studentId || ''}
                  disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '130px', marginBottom: 0 }}>
                <label className="form-label">Academic Year</label>
                <select
                  name="year"
                  className="form-input"
                  value={profileData.year}
                  onChange={handleProfileChange}
                  disabled={profileLoading}
                  style={{ height: '45px' }}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">College Email (Locked)</label>
              <input
                type="text"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number (For Handovers)</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                value={profileData.phone}
                onChange={handleProfileChange}
                disabled={profileLoading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-input"
                value={profileData.department}
                onChange={handleProfileChange}
                disabled={profileLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Right Side: Password Changes */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} style={{ color: 'var(--color-found)' }} /> Change Password
          </h3>

          {passSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-returned)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <CheckCircle size={16} /> <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--color-lost)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={16} /> <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className="form-input"
                placeholder="••••••••"
                value={passData.currentPassword}
                onChange={handlePassChange}
                required
                disabled={passLoading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="form-input"
                placeholder="••••••••"
                value={passData.newPassword}
                onChange={handlePassChange}
                required
                disabled={passLoading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                className="form-input"
                placeholder="••••••••"
                value={passData.confirmNewPassword}
                onChange={handlePassChange}
                required
                disabled={passLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={passLoading}>
              {passLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
