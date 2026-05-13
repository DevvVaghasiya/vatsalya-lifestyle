import React from 'react';
import { ArrowLeft, Info, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutApp = () => {
  const navigate = useNavigate();

  return (
    <div className="page-shell">
      <div className="page-header">
        <button type="button" className="icon-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="page-subtitle">App</p>
          <h1 className="page-title">About App</h1>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div className="page-container">
        <div className="form-card">
          <div className="section-header">
            <div className="section-icon" style={{ backgroundColor: '#EEF2FF', color: '#2563EB' }}>
              <Info size={22} />
            </div>
            <div>
              <h2 className="section-title">Vatsalya Lifestyle Mobile CRM</h2>
              <div className="section-underline" style={{ backgroundColor: '#2563EB' }} />
            </div>
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: '22px' }}>
            This app helps you manage clients, inquiries, inventory, and business operations in one place.
          </p>
          <div className="section-card" style={{ padding: '24px' }}>
            <div className="form-group">
              <label className="form-label">Version</label>
              <div className="form-input" style={{ paddingTop: '14px', paddingBottom: '14px' }}>1.0.0</div>
            </div>
            <div className="form-group">
              <label className="form-label">Built for Textile Traders</label>
              <div className="form-input" style={{ paddingTop: '14px', paddingBottom: '14px' }}>Easy inquiry and deal tracking.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Support</label>
              <div className="form-input" style={{ paddingTop: '14px', paddingBottom: '14px' }}>support@texdeal.example</div>
            </div>
            <button className="button button-secondary" style={{ padding: '18px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} />
              Check for Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;
