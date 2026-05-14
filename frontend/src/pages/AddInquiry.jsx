/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Plus, User, Briefcase, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddInquiry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: '',
    styleNo: '',
    quality: '',
    gsm: '',
    countConst: '',
    design: '',
    remark: '',
    sampleBooking: '',
    dyingPrintingMill: '',
    valueAdditionMill: '',
    redimate: '',
    submissionDate: new Date().toISOString().split('T')[0],
    articleNo: '',
    fabricName: '',
    gsn: '',
    width: '',
    submissionCountConst: '',
    composition: '',
    feedback: ''
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        let res = await api.get(`/api/clients`);
        let dbClients = res.data;
        if (dbClients.length === 0) {
          const localClients = JSON.parse(localStorage.getItem('clients') || '[]');
          if (localClients.length > 0) {
            for (const local of localClients) {
              await api.post(`/api/clients`, {
                name: local.name,
                gstIn: local.gstNumber || local.gstIn
              });
            }
            const updatedRes = await api.get(`/api/clients`);
            dbClients = updatedRes.data;
            localStorage.removeItem('clients');
          }
        }
        setClients(dbClients);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();

    const draft = localStorage.getItem('inquiry_draft');
    if (draft) {
      setFormData(JSON.parse(draft));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inquiry_draft', JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert('Please select a client');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    setLoading(true);
    try {
      const payload = {
        client: { id: formData.customerId },
        createdBy: { id: currentUser.id },
        lastEditedBy: { id: currentUser.id },
        ...formData
      };

      await api.post(`/api/inquiries`, payload);
      localStorage.removeItem('inquiry_draft');
      alert('Inquiry submitted successfully!');
      navigate('/inquiries');
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      alert('Failed to save inquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  return (
    <div className="page-shell">
      <div className="page-header">
        <button type="button" className="icon-btn" onClick={() => navigate('/inquiries')}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p className="page-subtitle">New Inquiry</p>
          <h1 className="page-title">Add New Inquiry</h1>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div className="page-container">
        <div className="main-content">
          <div className="form-card">
            <form onSubmit={handleSubmit}>

              <div className="section-card section-blue">
                <div className="section-header">
                  <div className="section-icon" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h2 className="section-title">Client's Inquiry</h2>
                    <div className="section-underline" style={{ backgroundColor: '#4F46E5' }} />
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label" style={{ margin: 0 }}>Select Client</label>
                    <button
                      type="button"
                      onClick={() => navigate('/add-client')}
                      className="button-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <Plus size={14} /> New Client
                    </button>
                  </div>
                  <select
                    className="form-input"
                    required
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                  >
                    <option value="">{loading ? 'Loading clients...' : 'Choose a client'}</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Style No</label>
                    <input type="text" className="form-input" name="styleNo" placeholder="ART-5001" required value={formData.styleNo} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quality</label>
                    <input type="text" className="form-input" name="quality" placeholder="Cotton Satin" required value={formData.quality} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">GSM</label>
                    <input type="text" className="form-input" name="gsm" placeholder="180" required value={formData.gsm} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Count / Const</label>
                    <input type="text" className="form-input" name="countConst" placeholder="40x40" required value={formData.countConst} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Design</label>
                  <input type="text" className="form-input" name="design" placeholder="e.g. Floral Print" required value={formData.design} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Client Remark</label>
                  <textarea className="form-input" name="remark" placeholder="Any additional instructions..." value={formData.remark} onChange={handleChange} />
                </div>
              </div>

              <div className="section-card section-teal">
                <div className="section-header">
                  <div className="section-icon" style={{ backgroundColor: '#F0FDFA', color: '#0D9488' }}>
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h2 className="section-title">What we are doing?</h2>
                    <div className="section-underline" style={{ backgroundColor: '#0D9488' }} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Sample Booking</label>
                    <input type="text" className="form-input" name="sampleBooking" placeholder="Enter details" value={formData.sampleBooking} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dying & Printing Mill</label>
                    <input type="text" className="form-input" name="dyingPrintingMill" placeholder="Enter mill name" value={formData.dyingPrintingMill} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Value Addition Mill</label>
                    <input type="text" className="form-input" name="valueAdditionMill" placeholder="Enter details" value={formData.valueAdditionMill} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Redimate</label>
                    <input type="text" className="form-input" name="redimate" placeholder="Enter details" value={formData.redimate} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="section-card section-amber">
                <div className="section-header">
                  <div className="section-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <h2 className="section-title">Submission Details</h2>
                    <div className="section-underline" style={{ backgroundColor: '#D97706' }} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <DatePicker
                      selected={formData.submissionDate ? new Date(formData.submissionDate) : null}
                      onChange={(date) => handleChange({ target: { name: 'submissionDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                      dateFormat="dd/MM/yyyy"
                      className="form-input"
                      placeholderText="dd/mm/yyyy"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Article No</label>
                    <input type="text" className="form-input" name="articleNo" placeholder="Enter article no" value={formData.articleNo} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fabric Name</label>
                    <input type="text" className="form-input" name="fabricName" placeholder="Enter fabric name" value={formData.fabricName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSN</label>
                    <input type="text" className="form-input" name="gsn" placeholder="Enter GSN" value={formData.gsn} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Width</label>
                    <input type="text" className="form-input" name="width" placeholder='e.g. 58"' value={formData.width} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Count / Const</label>
                    <input type="text" className="form-input" name="submissionCountConst" placeholder="Enter count/const" value={formData.submissionCountConst} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Composition</label>
                  <input type="text" className="form-input" name="composition" placeholder="e.g. 100% Cotton" value={formData.composition} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Feedback</label>
                  <textarea className="form-input" name="feedback" placeholder="Enter submission feedback..." value={formData.feedback} onChange={handleChange} />
                </div>
              </div>

              <button type="submit" className="button button-primary" disabled={loading} style={{ height: '56px', marginBottom: '40px' }}>
                <Send size={20} />
                {loading ? 'Saving Inquiry...' : 'Submit Full Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInquiry;
