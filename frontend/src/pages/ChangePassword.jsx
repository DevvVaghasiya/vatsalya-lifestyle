import { useState } from 'react';
import { ArrowLeft, Lock, Key, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    if (formData.newPassword.length < 4) {
      alert('New password must be at least 4 characters.');
      return;
    }

    if (!user.id) {
      alert('User session not found. Please log in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/users/${user.id}/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      alert('Password changed successfully!');
      navigate('/profile');
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.response?.status === 400) {
        alert('Current password is incorrect.');
      } else {
        alert('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <button type="button" className="icon-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="page-subtitle">Security</p>
          <h1 className="page-title">Change Password</h1>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div className="page-container">
        <div className="form-card">
          <div className="section-header">
            <div className="section-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Lock size={22} />
            </div>
            <div>
              <h2 className="section-title">Protect your account</h2>
              <div className="section-underline" style={{ backgroundColor: '#D97706' }} />
            </div>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Current password" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="New password" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" required />
              </div>
            </div>
            <button type="submit" className="button button-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? <Loader size={18} className="animate-spin" /> : <Key size={18} />}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
