import React from 'react';
import { ArrowLeft, Cloud, RefreshCcw, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackupSync = () => {
  const navigate = useNavigate();

  return (
    <div className="page-shell">
      <div className="page-header">
        <button type="button" className="icon-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="page-subtitle">Data</p>
          <h1 className="page-title">Backup & Sync</h1>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div className="page-container">
        <div className="form-card">
          <div className="section-header">
            <div className="section-icon" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
              <Cloud size={22} />
            </div>
            <div>
              <h2 className="section-title">Keep your data safe</h2>
              <div className="section-underline" style={{ backgroundColor: '#3B82F6' }} />
            </div>
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: '22px' }}>
            Create a remote backup of your business details and synchronize across devices.
          </p>

          <div className="section-card" style={{ padding: '20px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Last Backup</label>
                <input className="form-input" value={new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString()} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Sync Status</label>
                <input className="form-input" value="Connected" readOnly />
              </div>
            </div>
            <button className="button button-primary" style={{ padding: '18px' }}>
              <RefreshCcw size={18} />
              Sync Now
            </button>
            <button className="button button-secondary" style={{ marginTop: '12px', padding: '18px' }}>
              <ArrowDownCircle size={18} />
              Backup to Cloud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSync;
