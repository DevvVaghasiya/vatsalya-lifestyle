import { useState, useEffect } from 'react';
import {
  ArrowLeft, Search, Plus, MessageSquare, Clock,
  CheckCircle, XCircle, Tag, ChevronRight, Download
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import jsPDF from 'jspdf';

/* ── PDF helper ── */
const formatDateShort = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB');
  } catch { return dateStr; }
};

const generateInquiryPDF = (item) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    let y = 0;

    // ── Header band ──
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('INQUIRY DETAILS REPORT', pageW / 2, 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}  |  ID: #${item.id || '—'}`, pageW / 2, 24, { align: 'center' });

    // Status pill
    const statusColor = (item.status || '').toLowerCase() === 'completed'
      ? [16, 185, 129]
      : (item.status || '').toLowerCase() === 'canceled'
        ? [239, 68, 68]
        : [234, 88, 12];
    doc.setFillColor(...statusColor);
    doc.roundedRect(pageW / 2 - 20, 29, 40, 8, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text((item.status || 'ONGOING').toUpperCase(), pageW / 2, 34.5, { align: 'center' });

    y = 48;

    const sectionTitle = (title, r, g, b) => {
      doc.setFillColor(r, g, b);
      doc.rect(10, y, pageW - 20, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(title, 15, y + 6.5);
      y += 14;
      doc.setTextColor(30, 41, 59);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9.5);
    };

    const row = (label, value) => {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${label}:`, 15, y);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(String(value || 'N/A'), pageW - 75);
      doc.text(lines, 65, y);
      y += lines.length * 6 + 3;
    };

    const gap = () => { y += 4; };

    // ── Section 1: Client Inquiry ──
    sectionTitle("CLIENT'S INQUIRY", 79, 70, 229);
    row("Customer", item.client?.name);
    row("Style No", item.styleNo);
    row("Quality", item.quality);
    row("GSM", item.gsm);
    row("Count / Const", item.countConst);
    row("Design", item.design);
    if (item.remark) {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text("Remark:", 15, y);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(item.remark, pageW - 30);
      doc.text(lines, 15, y + 6);
      y += lines.length * 6 + 10;
    }
    gap();

    if (y > 200) { doc.addPage(); y = 20; }

    // ── Section 2: Submission ──
    sectionTitle("SUBMISSION DETAILS", 217, 119, 6);
    row("Submission Date", formatDateShort(item.submissionDate || item.createdAt));
    row("Article No", item.articleNo);
    row("Fabric Name", item.fabricName);
    row("GSM", item.submissionGsm);
    row("Width", item.width);
    row("Count / Const", item.submissionCountConst);
    row("Composition", item.composition);
    if (item.feedback) {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(217, 119, 6);
      doc.text("Feedback:", 15, y);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(item.feedback, pageW - 30);
      doc.text(lines, 15, y + 6);
      y += lines.length * 6 + 10;
    }

    // ── Footer ──
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageH - 14, pageW, 14, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Vatsalya Lifestyle — Textile Management System', pageW / 2, pageH - 5, { align: 'center' });

    const fileName = `Inquiry_${item.client?.name || 'Unknown'}_${item.id || ''}.pdf`
      .replace(/\s+/g, '_');
    doc.save(fileName);
  } catch (err) {
    console.error('PDF error:', err);
    alert('Failed to generate PDF');
  }
};

/* ── Component ── */
const Inquiries = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'ongoing');
  const [allInquiries, setAllInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/inquiries`);
        setAllInquiries(res.data || []);
      } catch (err) {
        console.error('Error fetching inquiries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries(); 
  }, []);

  const filteredInquiries = allInquiries.filter(item => {
    if (!item) return false;
    const itemStatus = (item.status || 'ongoing').toLowerCase();
    const statusMatches = itemStatus === activeTab;
    const search = (searchTerm || '').toLowerCase();
    const searchMatches =
      (item.client?.name || '').toLowerCase().includes(search) ||
      (item.styleNo || '').toLowerCase().includes(search) ||
      (item.quality || '').toLowerCase().includes(search);
    return statusMatches && searchMatches;
  });

  const TAB_STYLES = {
    ongoing: { bg: '#FFF7ED', color: '#EA580C', icon: <Clock size={12} /> },
    completed: { bg: '#F0FDF4', color: '#16A34A', icon: <CheckCircle size={12} /> },
    canceled: { bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={12} /> },
  };

  const getStatusStyle = (status) =>
    TAB_STYLES[(status || 'ongoing').toLowerCase()] || TAB_STYLES.ongoing;

  return (
    <div className="page-shell">
      {/* ── Sticky Header ── */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button type="button" className="icon-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="page-subtitle">Business</p>
            <h1 className="page-title">Inquiries</h1>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn"
          style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          onClick={() => navigate('/add-inquiry')}
        >
          <Plus size={20} />
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* ── Search ── */}
        <div className="search-container">
          <Search size={18} color="#64748B" />
          <input
            type="text"
            placeholder="Search by client, style or quality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* ── Tabs ── */}
        <div className="tabs-row" style={{ marginBottom: 20 }}>
          {['ongoing', 'completed', 'canceled'].map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        {/* ── List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ marginBottom: 12 }} />
              <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Fetching inquiries...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '72px 32px',
              background: 'white', borderRadius: 24, border: '2px dashed var(--border)'
            }}>
              <MessageSquare size={44} color="#CBD5E1" style={{ marginBottom: 14 }} />
              <p style={{ color: 'var(--muted)', fontWeight: 600 }}>
                No {activeTab} inquiries found
              </p>
            </div>
          ) : (
            filteredInquiries.map((item) => {
              const ss = getStatusStyle(item.status);
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{ padding: '20px', cursor: 'pointer', position: 'relative' }}
                >
                  {/* Top row: icon + name + status */}
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}
                    onClick={() => navigate(`/inquiry/${item.id}`)}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <div style={{
                        background: 'var(--primary-soft)', padding: 12,
                        borderRadius: 14, color: 'var(--primary)', flexShrink: 0
                      }}>
                        <MessageSquare size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.client?.name || 'Unknown Client'}
                        </h3>
                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag size={11} /> {item.styleNo || 'No Style No'}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      background: ss.bg, color: ss.color,
                      padding: '5px 12px', borderRadius: 10,
                      fontSize: '0.65rem', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      flexShrink: 0, marginLeft: 8
                    }}>
                      {item.status || 'Ongoing'}
                    </div>
                  </div>

                  {/* Bottom row: meta + pdf button + arrow */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 14, borderTop: '1px solid var(--border)'
                  }}>
                    {/* Meta fields */}
                    <div
                      style={{ display: 'flex', gap: 20, flex: 1 }}
                      onClick={() => navigate(`/inquiry/${item.id}`)}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: '0.58rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Quality</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>{item.quality || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.58rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Date</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* PDF Download Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); generateInquiryPDF(item); }}
                      title="Download Inquiry PDF"
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'var(--primary-soft)',
                        border: '1px solid rgba(79,70,229,0.12)',
                        color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0, marginRight: 6,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-soft)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    >
                      <Download size={16} />
                    </button>

                    <div
                      style={{ color: '#CBD5E1', cursor: 'pointer' }}
                      onClick={() => navigate(`/inquiry/${item.id}`)}
                    >
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Inquiries;
