import { useState, useEffect } from 'react';
import {
  ArrowLeft, Clock, CheckCircle, XCircle,
  User, Package, Calendar, Info, Hash, Palette,
  Briefcase, FileCheck, Edit3, Save, X, Download, Trash2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import jsPDF from 'jspdf';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addPdfHeader } from '../utils/pdfHeader';
import Toast from '../components/Toast';

// Helper components moved outside to prevent focus loss on re-render
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB');
  } catch {
    return dateStr;
  }
};

const DetailItem = ({ label, value, icon: Icon, name, editable = true, isEditing, editData, onChange, type = "text" }) => (
  <div className="detail-item">
    <div className="detail-icon-box">
      <Icon size={18} />
    </div>
    <div className="detail-content">
      <p className="detail-label">{label}</p>
      {isEditing && editable ? (
        type === 'date' ? (
          <DatePicker
            selected={editData[name] ? new Date(editData[name]) : null}
            onChange={(date) => onChange({ target: { name: name, value: date ? date.toISOString().split('T')[0] : '' } })}
            dateFormat="dd/MM/yyyy"
            className="detail-input"
            placeholderText="dd/mm/yyyy"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={editData[name] || ''}
            onChange={onChange}
            className="detail-input"
          />
        )
      ) : (
        <p className="detail-value">{type === 'date' ? formatDisplayDate(value) : (value || 'N/A')}</p>
      )}
    </div>
  </div>
);

const SectionWrapper = ({ title, icon: Icon, color, children }) => {
  const colorMap = {
    '#4F46E5': 'blue',
    '#0D9488': 'teal',
    '#D97706': 'amber'
  };
  const sectionClass = colorMap[color] || 'blue';
  
  return (
    <div className={`inquiry-section ${sectionClass}`}>
      <div className="section-head">
        <div className="section-icon-box">
          <Icon size={20} />
        </div>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="flex-col gap-4">
        {children}
      </div>
    </div>
  );
};

const InquiryDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchInquiryDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/inquiries/${id}`);
        setInquiry(res.data);
        setEditData(res.data);
      } catch (err) {
        console.error('Error fetching inquiry details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiryDetails();
  }, [id]);

  const fetchInquiryDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/inquiries/${id}`);
      setInquiry(res.data);
      setEditData(res.data);
    } catch (err) {
      console.error('Error fetching inquiry details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const payload = { ...editData };
      if (currentUser && currentUser.id) {
        payload.lastEditedBy = { id: currentUser.id };
      }

      await api.put(`/api/inquiries/${id}`, payload);
      alert('Inquiry updated successfully!');
      setIsEditing(false);
      fetchInquiryDetails();
    } catch (err) {
      console.error('Error updating inquiry:', err);
      alert('Failed to update inquiry');
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/api/inquiries/${id}/status?status=${newStatus}`);
      alert(`Inquiry ${newStatus} successfully!`);
      fetchInquiryDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update inquiry status');
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;
      


      // Header with gradient effect
      yPosition = addPdfHeader(doc, 'INQUIRY DETAILS REPORT');
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 116, 139);
      const reportDate = new Date().toLocaleDateString('en-GB');
      doc.text(`Generated: ${reportDate}`, pageWidth / 2, yPosition + 2, { align: 'center' });
      yPosition += 10;

      // Status Section
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(238, 242, 255);
      doc.rect(10, yPosition - 4, pageWidth - 20, 12, 'F');
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Status: ${inquiry.status || 'ONGOING'}`, 15, yPosition + 2);
      yPosition += 18;

      // Client's Inquiry Section
      doc.setFillColor(79, 70, 229);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.rect(10, yPosition - 5, pageWidth - 20, 8, 'F');
      doc.text("CLIENT'S INQUIRY", 15, yPosition);
      yPosition += 15;

      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);

      const clientData = [
        ['Customer Name', inquiry.client?.name || 'N/A'],
        ['Style No', inquiry.styleNo || 'N/A'],
        ['Quality', inquiry.quality || 'N/A'],
        ['GSM', inquiry.gsm || 'N/A'],
        ['Count/Const', inquiry.countConst || 'N/A'],
        ['Design', inquiry.design || 'N/A']
      ];

      clientData.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(`${label}:`, 15, yPosition);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const valueText = String(value);
        const splitValue = doc.splitTextToSize(valueText, pageWidth - 80);
        doc.text(splitValue, 60, yPosition);
        yPosition += 7;
      });

      // Client Remark
      doc.setFont(undefined, 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('Client Remark:', 15, yPosition);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      const remarkText = doc.splitTextToSize(inquiry.remark || 'No remarks provided', pageWidth - 30);
      doc.text(remarkText, 15, yPosition + 5);
      yPosition += remarkText.length * 5 + 12;

      // Check if new page is needed
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 15;
      }

      // Submission Section
      doc.setFillColor(217, 119, 6);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.rect(10, yPosition - 5, pageWidth - 20, 8, 'F');
      doc.text("SUBMISSION SECTION", 15, yPosition);
      yPosition += 15;

      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);

      const submissionData = [
        ['Date', formatDisplayDate(inquiry.submissionDate || inquiry.createdAt)],
        ['Article No', inquiry.articleNo || 'N/A'],
        ['Fabric Name', inquiry.fabricName || 'N/A'],
        ['GSM', inquiry.submissionGsm || 'N/A'],
        ['Width', inquiry.width || 'N/A'],
        ['Count/Const', inquiry.submissionCountConst || 'N/A'],
        ['Composition', inquiry.composition || 'N/A']
      ];

      submissionData.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(217, 119, 6);
        doc.text(`${label}:`, 15, yPosition);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(String(value), 60, yPosition);
        yPosition += 7;
      });

      // Feedback
      doc.setFont(undefined, 'bold');
      doc.setTextColor(217, 119, 6);
      doc.text('Feedback:', 15, yPosition);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      const feedbackText = doc.splitTextToSize(inquiry.feedback || 'No feedback yet', pageWidth - 30);
      doc.text(feedbackText, 15, yPosition + 5);
      yPosition += feedbackText.length * 5 + 10;

      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.text('Vatsalya Lifestyle - Textile Management System', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save PDF
      const fileName = `Inquiry_${inquiry.id || id}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      setToastMsg(`Inquiry report downloaded successfully!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg)' }}>
      <p style={{ color: 'var(--muted)', fontWeight: '500' }}>Loading inquiry details...</p>
    </div>
  );

  if (!inquiry) return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <p>Inquiry not found.</p>
      <button onClick={() => navigate('/inquiries')} className="btn btn-primary" style={{ marginTop: '20px' }}>Go Back</button>
    </div>
  );

  const getStatusStyle = (status) => {
    const s = (status || 'Ongoing').toLowerCase();
    switch (s) {
      case 'ongoing': return { bg: 'var(--status-warning-bg)', color: 'var(--status-warning-text)', icon: <Clock size={16} /> };
      case 'completed': return { bg: 'var(--status-success-bg)', color: 'var(--status-success-text)', icon: <CheckCircle size={16} /> };
      case 'canceled': return { bg: 'var(--status-danger-bg)', color: 'var(--status-danger-text)', icon: <XCircle size={16} /> };
      default: return { bg: 'var(--surface)', color: 'var(--muted)', icon: null };
    }
  };

  const statusInfo = getStatusStyle(inquiry.status);
  const isOngoing = (inquiry.status || 'Ongoing').toLowerCase() === 'ongoing';

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: '100px' }}>
      <div className="inquiry-header">
        <div className="inquiry-header-left">
          <button type="button" className="inquiry-header-back" onClick={() => navigate('/inquiries')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="inquiry-header-title">Inquiry Details</h1>
        </div>
        {isOngoing && (
          <button
            type="button"
            className="inquiry-header-btn"
            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            title={isEditing ? 'Save' : 'Edit'}
          >
            {isEditing ? <Save size={20} /> : <Edit3 size={20} />}
          </button>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        {/* Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div className={`status-badge ${(inquiry.status || 'Ongoing').toLowerCase()}`}>
            {statusInfo.icon}
            {inquiry.status || 'Ongoing'}
          </div>
        </div>

        {/* Section 1: Client's Inquiry */}
        <SectionWrapper title="Client's Inquiry" icon={User} color="#4F46E5">
          <DetailItem
            label="Customer Name"
            value={inquiry.client?.name}
            icon={User}
            editable={false}
            isEditing={isEditing}
            editData={editData}
            onChange={handleChange}
          />

          <div className="detail-row">
            <DetailItem label="Style No" value={inquiry.styleNo} icon={Hash} name="styleNo" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Quality" value={inquiry.quality} icon={Info} name="quality" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>

          <div className="detail-row">
            <DetailItem label="GSM" value={inquiry.gsm} icon={Hash} name="gsm" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Count/Const" value={inquiry.countConst} icon={Hash} name="countConst" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>

          <DetailItem label="Design" value={inquiry.design} icon={Palette} name="design" isEditing={isEditing} editData={editData} onChange={handleChange} />

          <div style={{ marginTop: '12px' }}>
            <p className="detail-label">Client Remark</p>
            {isEditing ? (
              <textarea
                name="remark"
                value={editData.remark || ''}
                onChange={handleChange}
                className="detail-textarea"
              />
            ) : (
              <div className="remark-box">
                <p>{inquiry.remark || 'No remarks provided'}</p>
              </div>
            )}
          </div>
        </SectionWrapper>

        {/* Section 2: What we are doing? */}
        <SectionWrapper title="What we are doing?" icon={Briefcase} color="#0D9488">
          <div className="detail-row">
            <DetailItem label="Sample Booking" value={inquiry.sampleBooking} icon={Package} name="sampleBooking" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Dying Mill" value={inquiry.dyingPrintingMill} icon={Briefcase} name="dyingPrintingMill" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <div className="detail-row">
            <DetailItem label="Value Addition" value={inquiry.valueAdditionMill} icon={Info} name="valueAdditionMill" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Readymade" value={inquiry.readymade} icon={CheckCircle} name="readymade" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
        </SectionWrapper>

        {/* Section 3: Submission Section */}
        <SectionWrapper title="Submission Section" icon={FileCheck} color="#D97706">
          <div className="detail-row">
            <DetailItem label="Date" value={inquiry.submissionDate || inquiry.createdAt} icon={Calendar} name="submissionDate" isEditing={isEditing} editData={editData} onChange={handleChange} type="date" />
            <DetailItem label="Article No" value={inquiry.articleNo} icon={Hash} name="articleNo" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>

          <div className="detail-row">
            <DetailItem label="Fabric Name" value={inquiry.fabricName} icon={Package} name="fabricName" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="GSM" value={inquiry.submissionGsm} icon={Hash} name="submissionGsm" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>

          <div className="detail-row">
            <DetailItem label="Width" value={inquiry.width} icon={Info} name="width" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Count/Const" value={inquiry.submissionCountConst} icon={Hash} name="submissionCountConst" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>

          <DetailItem label="Composition" value={inquiry.composition} icon={Info} name="composition" isEditing={isEditing} editData={editData} onChange={handleChange} />

          <div style={{ marginTop: '12px' }}>
            <p className="detail-label">Feedback</p>
            {isEditing ? (
              <textarea
                name="feedback"
                value={editData.feedback || ''}
                onChange={handleChange}
                className="detail-textarea"
              />
            ) : (
              <div className="feedback-box">
                <p>{inquiry.feedback || 'No feedback yet'}</p>
              </div>
            )}
          </div>
        </SectionWrapper>

        {/* Tracking Info Section */}
        <div className="inquiry-section" style={{ borderLeftColor: '#94A3B8', marginTop: '24px', padding: '16px 24px' }}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--muted)' }}>
                <User size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Added By</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)' }}>
                  {inquiry.createdBy?.name || 'System'}
                </p>
              </div>
            </div>

            {inquiry.lastEditedBy && (
              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--muted)' }}>
                  <Edit3 size={16} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Last Edited By</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)' }}>
                    {inquiry.lastEditedBy?.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isOngoing && !isEditing && (
          <div className="action-buttons">
            <button
              onClick={() => updateStatus('Canceled')}
              className="action-btn action-btn-cancel"
            >
              <XCircle size={18} />
              Cancel Inquiry
            </button>
            <button
              onClick={() => updateStatus('Completed')}
              className="action-btn action-btn-success"
            >
              <CheckCircle size={18} />
              Complete Inquiry
            </button>
          </div>
        )}

        {isEditing && (
          <div className="action-buttons">
            <button
              onClick={() => { setIsEditing(false); setEditData(inquiry); }}
              className="action-btn action-btn-secondary"
            >
              <X size={18} /> Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="action-btn action-btn-green"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        )}

        {/* Admin Delete Action */}
        {!isEditing && JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' && (
          <div className="action-buttons" style={{ marginTop: '16px' }}>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this inquiry? This action cannot be undone and it will be completely removed from the database.")) {
                  try {
                    await api.delete(`/api/inquiries/${id}`);
                    alert("Inquiry deleted successfully.");
                    navigate('/admin-dashboard');
                  } catch (err) {
                    console.error('Error deleting inquiry:', err);
                    alert("Failed to delete inquiry.");
                  }
                }
              }}
              className="action-btn"
              style={{ flex: 1, background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)', border: '1px solid var(--border)' }}
            >
              <Trash2 size={20} />
              Delete Inquiry (Admin Only)
            </button>
          </div>
        )}
      </div>
      <Toast 
        show={showToast} 
        message={toastMsg} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default InquiryDetails;
