import { useState } from 'react';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AddClient = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !gstNumber) return;

    setLoading(true);
    try {
      const newClient = {
        name,
        gstIn: gstNumber
      };

      await api.post(`/api/clients`, newClient);
      alert('Client saved successfully!');
      navigate(-1);
    } catch (err) {
      console.error('Error saving client:', err);
      alert('Failed to save client to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p className="page-subtitle">Partner Portal</p>
          <h1 className="page-title">Add New Client</h1>
        </div>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="page-container">
        <div className="form-card">
          <form onSubmit={handleSave}>
            <div className="section-card section-blue">
              <div className="section-header">
                <div className="section-icon" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="section-title">Business Registration</h2>
                  <div className="section-underline" style={{ backgroundColor: '#4F46E5' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Client / Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vardhaman Group"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 24AAAAA0000A1Z5"
                  required
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <button type="submit" className="button button-primary" disabled={loading} style={{ height: '56px', marginBottom: '40px' }}>
              <Save size={20} />
              {loading ? 'Saving Client...' : 'Save Registered Client'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClient;
