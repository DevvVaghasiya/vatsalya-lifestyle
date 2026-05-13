import React from 'react';
import { ArrowLeft, Settings, Briefcase, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="page-shell">
      <div className="page-header">
        <button type="button" className="icon-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="page-subtitle">Business</p>
          <h1 className="page-title">Business Settings</h1>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div className="page-container">
        <div className="form-card">
          <div className="section-header">
            <div className="section-icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Briefcase size={22} />
            </div>
            <div>
              <h2 className="section-title">Configure your workflow</h2>
              <div className="section-underline" style={{ backgroundColor: '#2563EB' }} />
            </div>
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: '22px' }}>
            Manage your business preferences and visibility settings from one place.
          </p>

          <div className="section-card" style={{ padding: '20px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input className="form-input" placeholder="TexDeal" />
              </div>
              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input className="form-input" placeholder="Enter GST number" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <input className="form-input" placeholder="INR" />
            </div>
            <button className="button button-primary" style={{ padding: '18px' }}>
              <Settings size={18} />
              Save Business Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
