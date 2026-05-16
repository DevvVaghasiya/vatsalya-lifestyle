import { useState, useEffect } from 'react';
import {
  Users, ClipboardList, Search,
  Clock, CheckCircle, XCircle, ChevronRight,
  Activity, ShieldCheck, Download, Package, Layers,
  UserCheck, UserX, Trash2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import jsPDF from 'jspdf';
import { addPdfHeader } from '../utils/pdfHeader';
import Toast from '../components/Toast';

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
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  let y = addPdfHeader(doc, 'INQUIRY REPORT');
  doc.setFontSize(9); doc.setFont(undefined,'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}  |  Total: ${inquiries.length} inquiries`, pw / 2, y + 2, { align: 'center' });
  y += 10;

  y = 42;
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
    return true;
  } catch (err) {
    console.error('PDF error:', err);
    return false;
  }
};

/* ─── Component ─── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'users');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [orderSubTab, setOrderSubTab] = useState('ongoing');
  const [inventorySubTab, setInventorySubTab] = useState('STOCK');
  const [approvingId, setApprovingId] = useState(null);

  const adminUser = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'users') {
          const res = await api.get(`/api/admin/users`);
          setUsers(res.data);
        } else if (activeTab === 'approvals') {
          const res = await api.get(`/api/admin/users/pending`);
          setPendingUsers(res.data);
        } else if (activeTab === 'inquiries') {
          const res = await api.get(`/api/inquiries`);
          setInquiries(res.data);
        } else if (activeTab === 'orders') {
          const res = await api.get(`/api/orders`);
          setOrders(res.data || []);
        } else if (activeTab === 'inventory') {
          const [s1, s2, s3, s4] = await Promise.all([
            api.get('/api/inventory/category/STOCK'),
            api.get('/api/inventory/category/SAMPLE'),
            api.get('/api/inventory/category/FABRIC_ENTRY'),
            api.get('/api/inventory/category/MILL_DEFECT'),
          ]);
          setInventory([
            ...(s1.data||[]).map(i=>({...i,category:'Stock'})),
            ...(s2.data||[]).map(i=>({...i,category:'Sample'})),
            ...(s3.data||[]).map(i=>({...i,category:'Fabric Entry'})),
            ...(s4.data||[]).map(i=>({...i,category:'Mill Defect'})),
          ]);
        } else if (activeTab === 'assets') {
          const res = await api.get(`/api/assets`);
          setAssets(res.data);
        }
      } catch (err) { console.error('Error fetching admin data:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [activeTab]);

  // Always fetch pending count for badge
  useEffect(() => {
    api.get('/api/admin/users/pending')
      .then(r => setPendingUsers(r.data))
      .catch(() => {});
  }, []);

  const handleApprove = async (userId) => {
    setApprovingId(userId);
    try {
      await api.patch(`/api/admin/users/${userId}/approve`);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) { console.error(e); }
    finally { setApprovingId(null); }
  };

  const handleReject = async (userId) => {
    setApprovingId(userId);
    try {
      await api.patch(`/api/admin/users/${userId}/reject`);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) { console.error(e); }
    finally { setApprovingId(null); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert("User deleted successfully.");
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMsg = err.response?.data?.error || "Failed to delete user. They may have associated records.";
      alert(errorMsg);
    }
  };

  const handleDeleteInquiry = async (e, inqId) => {
    e.stopPropagation(); // Don't navigate to details
    if (!window.confirm("Are you sure you want to delete this inquiry? This action cannot be undone and it will be completely removed from the database.")) return;
    
    try {
      await api.delete(`/api/inquiries/${inqId}`);
      setInquiries(prev => prev.filter(i => i.id !== inqId));
      alert("Inquiry deleted successfully.");
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      alert("Failed to delete inquiry.");
    }
  };

  const handleDeleteOrder = async (e, orderId) => {
    e.stopPropagation(); // Don't navigate to details
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone and it will be completely removed from the database.")) return;
    
    try {
      await api.delete(`/api/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      alert("Order deleted successfully.");
    } catch (err) {
      console.error('Error deleting order:', err);
      alert("Failed to delete order. It may have associated records.");
    }
  };

  const handleDeleteInventory = async (e, itemId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this inventory item? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/api/inventory/${itemId}`);
      setInventory(prev => prev.filter(i => i.id !== itemId));
      alert("Inventory item deleted successfully.");
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      alert("Failed to delete inventory item.");
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phoneNumber || '').includes(searchTerm) ||
    (u.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(u.id).includes(searchTerm)
  );

  const filteredInquiries = inquiries.filter(inq => {
    const matchSearch =
      (inq.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.styleNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(inq.id).includes(searchTerm);
    const matchFilter = filterStatus === 'All' || (inq.status || 'Ongoing') === filterStatus;
    return matchSearch && matchFilter;
  });

  const mapOrderStatus = (item) => {
    const status = item.status;
    if (!status) return 'Ongoing';
    const normalized = status.toLowerCase();

    if (normalized === 'completed') return 'Completed';
    if (normalized === 'canceled' || normalized === 'cancelled') return 'Canceled';
    if (normalized === 'delayed') return 'Delayed';

    // Check if Ongoing but Date passed
    if (item.completionDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completion = new Date(item.completionDate);
      if (completion < today && (['pending', 'processing', 'ongoing'].includes(normalized))) {
        return 'Delayed';
      }
    }

    return 'Ongoing';
  };

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
          padding: 5, marginBottom: 20, flexWrap: 'wrap'
        }}>
          {[
            { key: 'users',     label: 'Partners',  Icon: Users },
            { key: 'approvals', label: 'Approvals', Icon: UserCheck, badge: pendingUsers.length },
            { key: 'inquiries', label: 'Inquiries', Icon: ClipboardList },
            { key: 'orders',    label: 'Orders',    Icon: Package },
            { key: 'inventory', label: 'Inventory', Icon: Layers },
          ].map(({ key, label, Icon, badge }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchTerm(''); setFilterStatus('All'); }}
              style={{
                flex: 1, minWidth: 80, padding: '12px 10px', borderRadius: 14,
                border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s',
                background: activeTab === key ? 'white' : 'transparent',
                color: activeTab === key ? 'var(--primary)' : 'var(--muted)',
                boxShadow: activeTab === key ? 'var(--shadow-sm)' : 'none',
                position: 'relative'
              }}
            >
              <Icon size={15} /> {label}
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  background: '#EF4444', color: 'white',
                  fontSize: '0.6rem', fontWeight: 900,
                  borderRadius: '50%', width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{badge > 9 ? '9+' : badge}</span>
              )}
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
            placeholder={
              activeTab === 'users' ? 'Search partners by name or phone...' :
              activeTab === 'orders' ? 'Search orders by client or style...' :
              activeTab === 'inventory' ? 'Search inventory by fabric or ref...' :
              'Search inquiries by client or style...'
            }
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
              onClick={async () => {
                const success = await exportInquiriesPDF(filteredInquiries);
                if (success) {
                  setToastMsg('Inquiry Summary PDF downloaded!');
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 4000);
                }
              }}
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

          ) : activeTab === 'approvals' ? (
            /* ── Pending Approvals ── */
            <motion.div key="approvals" variants={stagger} initial="hidden" animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <p style={{ margin: '0 0 4px 2px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {pendingUsers.length} {pendingUsers.length === 1 ? 'request' : 'requests'} awaiting approval
              </p>

              {pendingUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                  <p style={{ fontWeight: 800, color: 'var(--text)', margin: 0 }}>All caught up!</p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '6px 0 0' }}>No pending approval requests.</p>
                </div>
              ) : pendingUsers.map(u => {
                const initials = (u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const avatarColor = getAvatarColor(u.name);
                const isProcessing = approvingId === u.id;
                return (
                  <motion.div key={u.id} variants={pop} layout
                    style={{
                      background: 'white', borderRadius: 20,
                      padding: '18px 20px', border: '1px solid #FEF3C7',
                      boxShadow: '0 2px 8px rgba(234,179,8,0.1)',
                      display: 'flex', gap: 14, alignItems: 'center'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: `${avatarColor}18`, color: avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '1rem', border: `2px solid ${avatarColor}22`
                    }}>{initials}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>{u.name || 'Unnamed'}</h3>
                        <span style={{ background: '#FEF9C3', color: '#A16207', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Pending</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{u.phoneNumber}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                        Requested: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '—'}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleApprove(u.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', borderRadius: 10, border: 'none',
                          background: '#DCFCE7', color: '#16A34A',
                          fontWeight: 800, fontSize: '0.78rem', cursor: isProcessing ? 'not-allowed' : 'pointer',
                          opacity: isProcessing ? 0.6 : 1, transition: 'all 0.2s'
                        }}
                      >
                        <UserCheck size={14} /> Approve
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleReject(u.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', borderRadius: 10, border: 'none',
                          background: '#FEE2E2', color: '#DC2626',
                          fontWeight: 800, fontSize: '0.78rem', cursor: isProcessing ? 'not-allowed' : 'pointer',
                          opacity: isProcessing ? 0.6 : 1, transition: 'all 0.2s'
                        }}
                      >
                        <UserX size={14} /> Reject
                      </button>
                    </div>
                  </motion.div>
                );
              })}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 8,
                            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                            background: u.role === 'ADMIN' ? '#FEF2F2' : '#EEF2FF',
                            color: u.role === 'ADMIN' ? '#DC2626' : '#4F46E5',
                          }}>
                            {u.role}
                          </span>
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              style={{
                                padding: '6px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#FEE2E2',
                                color: '#DC2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
                              }}
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
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

          ) : activeTab === 'inquiries' ? (
            /* ── Inquiries List ── */
            <motion.div key="inquiries" variants={stagger} initial="hidden" animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <p style={{ margin: '0 0 4px 2px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {filteredInquiries.length} records
              </p>
              {filteredInquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontWeight: 700, opacity: 0.5 }}>No inquiries matched the filter.</div>
              ) : filteredInquiries.map(inq => {
                const ss = getStatus(inq.status);
                const StatusIcon = ss.Icon;
                return (
                  <motion.div key={inq.id} variants={pop} layout whileHover={{ y: -2 }}
                    onClick={() => navigate(`/inquiry/${inq.id}`)}
                    style={{ background: 'white', borderRadius: 20, padding: '18px 20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Activity size={18} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>{inq.client?.name || 'Unknown'}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)' }}>Ref: {inq.styleNo || 'N/A'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: ss.bg, color: ss.color, padding: '4px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800 }}>
                        <StatusIcon size={10} /> {inq.status || 'Ongoing'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={(e) => handleDeleteInquiry(e, inq.id)}
                        style={{
                          background: '#FEE2E2', color: '#DC2626', border: 'none',
                          padding: '6px 10px', borderRadius: 8, fontSize: '0.7rem',
                          fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4,
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>View Details</span>
                        <ChevronRight size={13} color="var(--primary)" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          ) : activeTab === 'orders' ? (
            /* ── Orders List ── */
            (() => {
              const filtered = orders.filter(o => {
                const statusGroup = mapOrderStatus(o);
                const matchesSubTab = orderSubTab === 'all' ? true : statusGroup.toLowerCase() === orderSubTab;
                const matchesSearch = (o.client?.name||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     (o.styleNo||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     String(o.id).includes(searchTerm);
                return matchesSubTab && matchesSearch;
              });

              const mapStatusStyles = o => {
                const s = mapOrderStatus(o).toLowerCase();
                if (s === 'completed') return { label:'Completed', bg:'#DCFCE7', color:'#166534' };
                if (s === 'canceled') return { label:'Canceled', bg:'#FEE2E2', color:'#B91C1C' };
                if (s === 'delayed') return { label:'Delayed', bg:'#FEF2F2', color:'#EF4444' };
                return { label:'Ongoing', bg:'#EEF2FF', color:'#4F46E5' };
              };

              return (
                <motion.div key="orders" variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Order Sub-Tabs */}
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 8, scrollbarWidth: 'none' }}>
                    {['ongoing', 'delayed', 'completed', 'canceled'].map(s => (
                      <button
                        key={s}
                        onClick={() => setOrderSubTab(s)}
                        style={{
                          padding: '8px 18px', borderRadius: 20,
                          cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem',
                          whiteSpace: 'nowrap', flexShrink: 0,
                          background: orderSubTab === s ? 'var(--primary)' : 'white',
                          color: orderSubTab === s ? 'white' : 'var(--muted)',
                          border: orderSubTab === s ? 'none' : '1px solid var(--border)',
                          boxShadow: orderSubTab === s ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>

                  <p style={{ margin: '0 0 4px 2px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{filtered.length} {orderSubTab} orders</p>
                  
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontWeight: 700, opacity: 0.5 }}>No {orderSubTab} orders found.</div>
                  ) : filtered.map(order => {
                    const st = mapStatusStyles(order);
                    const dispatchTotal = (order.dispatchQuantityReceivedEntries||[]).reduce((s,e)=>s+(e.quantity||0),0);
                    return (
                      <motion.div key={order.id} variants={pop} layout whileHover={{ y: -2 }}
                        onClick={() => navigate(`/deal-detail/${order.id}`)}
                        style={{ background: 'white', borderRadius: 20, padding: '18px 20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>{order.client?.name || 'N/A'}</h4>
                            <p style={{ margin: '2px 0 0', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)' }}>Style: {order.styleNo || 'N/A'} · #{order.id}</p>
                          </div>
                          <div style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800 }}>{st.label}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: '#F8FAFC', borderRadius: 12, padding: '10px 14px', marginBottom: 10 }}>
                          {[
                            { label: 'Booking', value: `${order.bookingQuantity||0} mtr` },
                            { label: 'Dispatch', value: `${dispatchTotal} mtr` },
                            { label: 'Delivery', value: order.completionDate ? new Date(order.completionDate).toLocaleDateString('en-GB') : '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p style={{ margin: 0, fontSize: '0.58rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
                              <p style={{ margin: '3px 0 0', fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>{value}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            onClick={(e) => handleDeleteOrder(e, order.id)}
                            style={{
                              background: '#FEE2E2', color: '#DC2626', border: 'none',
                              padding: '6px 10px', borderRadius: 8, fontSize: '0.7rem',
                              fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>View Order</span>
                            <ChevronRight size={13} color="var(--primary)" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            })()

          ) : activeTab === 'inventory' ? (
            /* ── Inventory List ── */
            (() => {
              const filtered = inventory.filter(i => {
                const normalizedCat = (i.category||'').toUpperCase().replace(/\s+/g, '_');
                const matchesSubTab = normalizedCat === inventorySubTab;
                const matchesSearch = (i.fabricName||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     (i.referenceNo||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     String(i.id).includes(searchTerm);
                return matchesSubTab && matchesSearch;
              });

              const catColor = { STOCK:'#4F46E5', SAMPLE:'#0D9488', FABRIC_ENTRY:'#D97706', MILL_DEFECT:'#DC2626' };
              const catBg    = { STOCK:'#EEF2FF', SAMPLE:'#F0FDFA', FABRIC_ENTRY:'#FFFBEB', MILL_DEFECT:'#FEF2F2' };
              const subTabLabels = { STOCK: 'Stock', SAMPLE: 'Sample', FABRIC_ENTRY: 'Fabric Entry', MILL_DEFECT: 'Mill Defect' };

              return (
                <motion.div key="inventory" variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Inventory Sub-Tabs */}
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 8, scrollbarWidth: 'none' }}>
                    {['STOCK', 'SAMPLE', 'MILL_DEFECT', 'FABRIC_ENTRY'].map(s => (
                      <button
                        key={s}
                        onClick={() => setInventorySubTab(s)}
                        style={{
                          padding: '8px 18px', borderRadius: 20,
                          cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem',
                          whiteSpace: 'nowrap', flexShrink: 0,
                          background: inventorySubTab === s ? catColor[s] : 'white',
                          color: inventorySubTab === s ? 'white' : 'var(--muted)',
                          border: inventorySubTab === s ? 'none' : '1px solid var(--border)',
                          boxShadow: inventorySubTab === s ? `0 4px 12px ${catColor[s]}33` : 'var(--shadow-sm)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {subTabLabels[s]}
                      </button>
                    ))}
                  </div>

                  <p style={{ margin: '0 0 4px 2px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{filtered.length} {subTabLabels[inventorySubTab]} items</p>
                  
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontWeight: 700, opacity: 0.5 }}>No {subTabLabels[inventorySubTab]} items found.</div>
                  ) : (
                    filtered.map(item => {
                      const available = (item.stockQuantity||0) - (item.soldQuantity||0);
                      const itemCatKey = (item.category||'').toUpperCase().replace(/\s+/g, '_');
                      const cc = catColor[itemCatKey]||'#4F46E5';
                      const cb = catBg[itemCatKey]||'#EEF2FF';
                      return (
                        <motion.div key={item.id} variants={pop} layout whileHover={{ y: -2 }}
                          style={{ background: 'white', borderRadius: 20, padding: '18px 20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <div style={{ width: 40, height: 40, borderRadius: 12, background: cb, color: cc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
                                {(item.fabricName||'F').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>{item.fabricName}</h4>
                                {item.referenceNo && <p style={{ margin: '2px 0 0', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)' }}>Ref: {item.referenceNo}</p>}
                              </div>
                            </div>
                            <span style={{ background: cb, color: cc, padding: '4px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800 }}>{subTabLabels[itemCatKey]}</span>
                          </div>
                          {itemCatKey !== 'FABRIC_ENTRY' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: '#F8FAFC', borderRadius: 12, padding: '10px 14px' }}>
                              {[
                                { label: 'Available', value: `${available} Mtr`, highlight: available > 0 ? '#16A34A' : '#EF4444' },
                                { label: 'Total', value: `${item.stockQuantity||0} Mtr`, highlight: '#1E293B' },
                                { label: 'Dispatched', value: `${item.soldQuantity||0} Mtr`, highlight: '#D97706' },
                              ].map(({ label, value, highlight }) => (
                                <div key={label}>
                                  <p style={{ margin: 0, fontSize: '0.58rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
                                  <p style={{ margin: '3px 0 0', fontSize: '0.85rem', fontWeight: 800, color: highlight }}>{value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                            <button
                              onClick={(e) => handleDeleteInventory(e, item.id)}
                              style={{
                                background: '#FEE2E2', color: '#DC2626', border: 'none',
                                padding: '6px 10px', borderRadius: 8, fontSize: '0.7rem',
                                fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4,
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={12} /> Delete Item
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              );
            })()
          ) : null}
        </AnimatePresence>
      </div>
      <Toast 
        show={showToast} 
        message={toastMsg} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default AdminDashboard;
