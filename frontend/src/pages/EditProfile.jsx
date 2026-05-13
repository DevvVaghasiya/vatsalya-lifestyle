import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Building2, Save, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../utils/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phoneNumber: user.phoneNumber || '',
    email: user.email || '',
    businessName: user.businessName || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.id) {
      alert('User session not found. Please log in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/api/users/${user.id}`, {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        businessName: formData.businessName,
      });

      // Update localStorage with the server response so the whole app stays in sync
      const updatedUser = { ...user, ...res.data };
      // Don't store password in localStorage
      delete updatedUser.password;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.status === 404) {
        alert('User not found. Please log in again.');
      } else {
        alert('Failed to update profile. Please try again.');
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
          <p className="page-subtitle">Profile</p>
          <h1 className="page-title">Edit Profile</h1>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div className="page-container">
        <div className="form-card">
          <div className="section-header">
            <div className="section-icon" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <User size={22} />
            </div>
            <div>
              <h2 className="section-title">Update your details</h2>
              <div className="section-underline" style={{ backgroundColor: '#4F46E5' }} />
            </div>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input className="form-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Your phone number" />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input className="form-input" name="email" value={formData.email} onChange={handleChange} placeholder="Your email address" type="email" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <div className="input-with-icon">
                <Building2 size={18} className="input-icon" />
                <input className="form-input" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Your business name" />
              </div>
            </div>
            <button type="submit" className="button button-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
