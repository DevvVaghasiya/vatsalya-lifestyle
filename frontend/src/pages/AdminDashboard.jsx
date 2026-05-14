import { useState, useEffect } from 'react';
import {
  Users, ClipboardList, Search,
  Clock, CheckCircle, XCircle, ChevronRight,
  Activity, ShieldCheck, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import jsPDF from 'jspdf';

/* ─── Status helpers ─── */
const STATUS_MAP = {
  completed: { bg: '#ECFDF5', color: '#16A34A', Icon: CheckCircle },
  canceled:  { bg: '#FEF2F2', color: '#EF4444', Icon: XCircle },
  ongoing:   { bg: '#FFF7ED', color: '#EA580C', Icon: Clock },
};
const getStatus = (s) => STATUS_MAP[(s || '').toLowerCase()] || STATUS_MAP.ongoing;

const AVATAR_COLORS = ['#4F46E5','#0D9488','#D97706','#7C3AED','#DC2626','#0EA5E9','#16A34A'];
const getAvatarColor = (name) => {
  const str = name || '';
  if (!str) return AVATAR_COLORS[0];
  return AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
};

/* ─── Quick PDF export for all inquiries ─── */
const exportInquiriesPDF = (inquiries) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pw, 32, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(16); doc.setFont(undefined,'bold');
  doc.text('VATSALYA LIFESTYLE — INQUIRY REPORT', pw / 2, 13, { align: 'center' });
  doc.setFontSize(9); doc.setFont(undefined,'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}  |  Total: ${inquiries.length} inquiries`, pw / 2, 23, { align: 'center' });

  let y = 42;
  const headers = ['Client', 'Style No', 'Quality', 'Status', 'Date'];
  const xs = [14, 69, 104, 144, 172];

  // Header row
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y - 6, pw - 20, 10, 'F');
  doc.setFontSize(8); doc.setFont(undefined, 'bold'); doc.setTextColor(100, 116, 139);
  headers.forEach((h, i) => doc.text(h, xs[i], y));
  y += 8;

  doc.setFont(undefined, 'normal'); doc.setFontSize(8);
  inquiries.forEach((inq, idx) => {
    if (y > 268) { doc.addPage(); y = 20; }
    if (idx % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(10, y - 5, pw - 20, 9, 'F'); }
    doc.setTextColor(30, 41, 59);
    const row = [
      inq.client?.name || 'N/A',
      inq.styleNo || 'N/A',
      inq.quality || 'N/A',
      inq.status || 'Ongoing',
      inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-GB') : 'N/A'
    ];
    row.forEach((cell, i) => doc.text(String(cell).slice(0, 20), xs[i], y));
    y += 9;
  });

  const ph = doc.internal.pageSize.getHeight();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, ph - 10, pw, 10, 'F');
  doc.setTextColor(148, 163, 184); doc.setFontSize(7);
  doc.text('Vatsalya Lifestyle — Admin Report', pw / 2, ph - 4, { align: 'center' });

  doc.save(`Admin_Inquiries_${new Date().toLocaleDateString('en-GB').replace(/\//g,'-')}.pdf`);
};

/* ─── Component ─── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'users') {
          const res = await api.get(`/api/admin/users`);
          setUsers(res.data);
        } else {
          const res = await api.get(`/api/inquiries`);
          setInquiries(res.data);
        }
      } catch (err) { console.error('Error fetching admin data:', err); }
      finally { setLoading(false); }
    };
    fetchData(); 
  }, [activeTab]);

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phoneNumber || '').includes(searchTerm) ||
    (u.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInquiries = inquiries.filter(inq => {
    const matchSearch =
      (inq.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.styleNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'All' || (inq.status || 'Ongoing') === filterStatus;
    return matchSearch && matchFilter;
  });

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const pop    = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  /* shared input style */
  const searchStyle = {
    flex: 1, border: 'none', outline: 'none',
    fontSize: '0.92rem', fontWeight: 500,
    color: 'var(--text)', background: 'transparent'
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>

      {/* ── Admin Top Bar ── */}
      <div className="page-header" style={{ background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, overflow: 'hidden',
            border: '2px solid var(--primary)', flexShrink: 0
          }}>
            <img
              src={adminUser.profilePictureUrl || 'https://i.pravatar.cc/150?img=12'}
              alt="Admin"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              Admin Console
            </h1>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Vatsalya Lifestyle
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#ECFDF5', borderRadius: 10, padding: '6px 12px'
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live
            </span>
          </div>
          <button
            className="icon-btn"
            onClick={() => navigate('/profile')}
            style={{ color: 'var(--primary)', background: 'var(--primary-soft)' }}
          >
            <ShieldCheck size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: 960, margin: '0 auto' }}>

        {/* ── Stats Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 60%, #7C3AED 100%)',
            borderRadius: 24, padding: '24px 24px 20px',
            marginBottom: 20, position: 'relative', overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

          <p style={{ margin: '0 0 4px', fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Platform Overview
          </p>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center', position: 'relative', flexWrap: 'wrap' }}>
            {[
              { label: 'Partners', value: users.length || '—', icon: Users },
              { label: 'Inquiries', value: inquiries.length || '—', icon: ClipboardList },
              { label: 'Ongoing', value: inquiries.filter(i => (i.status||'').toLowerCase() === 'ongoing').length || '—', icon: Activity },
              { label: 'Completed', value: inquiries.filter(i => (i.status||'').toLowerCase() === 'completed').length || '—', icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{value}</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon size={10} /> {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tab Switcher ── */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(0,0,0,0.04)', borderRadius: 18,
          padding: 5, marginBottom: 20
        }}>
          {[
            { key: 'users', label: 'Partners', Icon: Users },
            { key: 'inquiries', label: 'Inquiries', Icon: ClipboardList },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchTerm(''); setFilterStatus('All'); }}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 14,
                border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: '0.88rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                background: activeTab === key ? 'white' : 'transparent',
                color: activeTab === key ? 'var(--primary)' : 'var(--muted)',
                boxShadow: activeTab === key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'white', borderRadius: 16, padding: '13px 18px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          marginBottom: activeTab === 'inquiries' ? 12 : 20
        }}>
          <Search size={17} color="#94A3B8" />
          <input
            type="text"
            placeholder={activeTab === 'users' ? 'Search partners by name or phone...' : 'Search inquiries by client or style...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={searchStyle}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'var(--bg)', border: 'none', borderRadius: 8, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>

        {/* ── Inquiry Status Filter ── */}
        {activeTab === 'inquiries' && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16, scrollbarWidth: 'none' }}>
            {['All', 'Ongoing', 'Completed', 'Canceled'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '8px 18px', borderRadius: 20,
                  cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  background: filterStatus === s ? 'var(--primary)' : 'white',
                  color: filterStatus === s ? 'white' : 'var(--muted)',
                  border: filterStatus === s ? 'none' : '1px solid var(--border)',
                  boxShadow: filterStatus === s ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                {s}
              </button>
            ))}

            {/* Export PDF */}
            <button
              onClick={() => exportInquiriesPDF(filteredInquiries)}
              title="Export as PDF"
              style={{
                marginLeft: 'auto', padding: '8px 16px', borderRadius: 20,
                border: '1px solid var(--border)', cursor: 'pointer',
                fontWeight: 800, fontSize: '0.78rem',
                background: 'white', color: 'var(--text)',
                display: 'flex', alignItems: 'center', gap: 6,
                flexShrink: 0, boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        )}

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '60px 0' }}
            >
              <div className="spinner" style={{ marginBottom: 12 }} />
              <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Synchronizing systems...</p>
            </motion.div>

          ) : activeTab === 'users' ? (
            /* ── Partners List ── */
            <motion.div key="users" variants={stagger} initial="hidden" animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <p style={{ margin: '0 0 4px 2px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {filteredUsers.length} {filteredUsers.length === 1 ? 'partner' : 'partners'} registered
              </p>

              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontWeight: 700, opacity: 0.5 }}>
                  No partners matched the search.
                </div>
              ) : filteredUsers.map(u => {
                const initials = (u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const avatarColor = getAvatarColor(u.name);
                return (
                  <motion.div key={u.id} variants={pop} layout
                    style={{
                      background: 'white', borderRadius: 20,
                      padding: '18px 20px', border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 16, alignItems: 'flex-start'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                      background: `${avatarColor}18`, color: avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '1.1rem',
                      border: `2px solid ${avatarColor}22`
                    }}>
                      {initials}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>
                          {u.name || 'Unnamed Partner'}
                        </h3>
                        <span style={{
                          padding: '3px 10px', borderRadius: 8,
                          fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                          background: u.role === 'ADMIN' ? '#FEF2F2' : '#EEF2FF',
                          color: u.role === 'ADMIN' ? '#DC2626' : '#4F46E5',
                          flexShrink: 0
                        }}>
                          {u.role}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>
                        {u.businessName || 'Vatsalya Lifestyle Partner'}
                      </p>

                      <div style={{ display: 'flex', gap: 20, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Contact</p>
                          <p style={{ margin: '3px 0 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{u.phoneNumber || '—'}</p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Joined</p>
                          <p style={{ margin: '3px 0 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          ) : (
            /* ── Inquiries List ── */
            <motion.div key="inquiries" variants={stagger} initial="hidden" animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <p style={{ margin: '0 0 4px 2px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {filteredInquiries.length} records
              </p>

              {filteredInquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontWeight: 700, opacity: 0.5 }}>
                  No inquiries matched the filter.
                </div>
              ) : filteredInquiries.map(inq => {
                const ss = getStatus(inq.status);
                const StatusIcon = ss.Icon;
                return (
                  <motion.div key={inq.id} variants={pop} layout
                    whileHover={{ y: -2 }}
                    onClick={() => navigate(`/inquiry/${inq.id}`)}
                    style={{
                      background: 'white', borderRadius: 20,
                      padding: '18px 20px', border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                      transition: 'box-shadow 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                          background: 'var(--primary-soft)', color: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Activity size={20} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {inq.client?.name || 'Unknown Client'}
                          </h4>
                          <p style={{ margin: '3px 0 0', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            Ref: {inq.styleNo || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: ss.bg, color: ss.color,
                        padding: '5px 12px', borderRadius: 10,
                        fontSize: '0.65rem', fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        flexShrink: 0, marginLeft: 8
                      }}>
                        <StatusIcon size={11} />
                        {inq.status || 'Ongoing'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                      {[
                        { label: 'Quality', value: inq.quality || 'Standard' },
                        { label: 'Date', value: inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-GB') : '—' }
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 12 }}>
                          <p style={{ margin: 0, fontSize: '0.58rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{label}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        View Details
                      </span>
                      <ChevronRight size={14} color="var(--primary)" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
