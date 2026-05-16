/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Building2, Hash, Briefcase, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const AVATAR_COLORS = [
  ['#4F46E5', 'rgba(79, 70, 229, 0.12)'],
  ['#0D9488', 'rgba(13, 148, 136, 0.12)'],
  ['#D97706', 'rgba(217, 119, 6, 0.12)'],
  ['#7C3AED', 'rgba(124, 58, 237, 0.12)'],
  ['#DC2626', 'rgba(220, 38, 38, 0.12)'],
  ['#0EA5E9', 'rgba(14, 165, 233, 0.12)'],
  ['#16A34A', 'rgba(22, 163, 74, 0.12)'],
];

const getAvatarColor = (name) => {
  const str = name || '';
  if (!str) return AVATAR_COLORS[0];
  const idx = str.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] || AVATAR_COLORS[0];
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }
};

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/clients');
      if (res.data.length === 0) {
        const localClients = JSON.parse(localStorage.getItem('clients') || '[]');
        if (localClients.length > 0) {
          for (const local of localClients) {
            await api.post('/api/clients', {
              name: local.name,
              gstIn: local.gstNumber || local.gstIn
            });
          }
          const updatedRes = await api.get('/api/clients');
          setClients(updatedRes.data);
          localStorage.removeItem('clients');
          return;
        }
      }
      setClients(res.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Unable to connect to server. The backend may be starting up — please retry in a moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDeleteClient = async (e, id, name) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove client "${name || 'Unknown'}"?`)) {
      return;
    }
    try {
      await api.delete(`/api/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting client:', err);
      const msg = err.response?.data?.error || 'Unable to delete client. They may have active orders or inquiries associated with them.';
      alert(msg);
    }
  };

  const filtered = clients.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.gstIn || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>

      {/* ── Premium Page Header ── */}
      <div className="page-header" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" className="icon-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="page-subtitle">Partner Network</p>
            <h1 className="page-title">My Clients</h1>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={() => navigate('/add-client')}
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 16px var(--primary-glow)'
          }}
        >
          <Plus size={22} strokeWidth={3} />
        </motion.button>
      </div>

      <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>

        {/* ── Stats Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            borderRadius: 24, padding: '24px 28px',
            marginBottom: 24, position: 'relative', overflow: 'hidden'
          }}
        >
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 150, height: 150, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: -40, right: 60,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Registered Partners
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '2.6rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-1px' }}>
                {clients.length}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                Active business relationships
              </p>
            </div>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Briefcase size={30} color="white" />
            </div>
          </div>
        </motion.div>

        {/* ── Search Bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--surface)', borderRadius: 16,
            padding: '14px 18px', marginBottom: 20,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'box-shadow 0.2s'
          }}
        >
          <Search size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by name or GST number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '0.95rem', fontWeight: 500,
              color: 'var(--text)', background: 'transparent'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'var(--bg)', border: 'none',
                borderRadius: 8, padding: '2px 8px',
                fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--muted)', cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </motion.div>

        {/* ── Client List ── */}
        {error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center', padding: '52px 32px',
              background: 'var(--surface)', borderRadius: 24,
              border: '2px dashed #FCA5A5'
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <RefreshCw size={28} color="#EF4444" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)', margin: '0 0 8px' }}>
              Connection Issue
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 20px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              {error}
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={fetchClients}
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'white', border: 'none',
                padding: '12px 28px', borderRadius: 14,
                fontWeight: 800, fontSize: '0.9rem',
                cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', gap: 8,
                boxShadow: '0 8px 20px var(--primary-glow)'
              }}
            >
              <RefreshCw size={16} /> Retry
            </motion.button>
          </motion.div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading clients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center', padding: '72px 32px',
              background: 'var(--surface)', borderRadius: 24,
              border: '2px dashed var(--border)'
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <Building2 size={34} color="#CBD5E1" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', margin: '0 0 8px' }}>
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: '0 0 24px' }}>
              {searchTerm
                ? `We couldn't match "${searchTerm}"`
                : 'Add your first business partner to get started.'}
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/add-client')}
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'white', border: 'none',
                  padding: '14px 28px', borderRadius: 14,
                  fontWeight: 800, fontSize: '0.95rem',
                  cursor: 'pointer', display: 'inline-flex',
                  alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 20px var(--primary-glow)'
                }}
              >
                <Plus size={18} /> Add First Client
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Results count */}
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: 12, marginLeft: 2 }}>
              {filtered.length} {filtered.length === 1 ? 'client' : 'clients'}{searchTerm ? ` matching "${searchTerm}"` : ''}
            </p>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <AnimatePresence>
                {filtered.map((client) => {
                  const [fg, bg] = getAvatarColor(client.name);
                  const initials = (client.name || '?')
                    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <motion.div
                      key={client.id}
                      variants={cardAnim}
                      layout
                      whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(15,23,42,0.08)' }}
                      style={{
                        background: 'var(--surface)',
                        borderRadius: 20,
                        padding: '18px 20px',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s'
                      }}
                    >
                      {/* Accent left bar */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: 4, background: fg, borderRadius: '20px 0 0 20px'
                      }} />

                      {/* Avatar */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: bg, color: fg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.1rem',
                        flexShrink: 0, letterSpacing: '-0.5px',
                        border: `2px solid ${fg}22`
                      }}>
                        {initials}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          margin: 0, fontWeight: 800, fontSize: '1rem',
                          color: 'var(--text)', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {client.name}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          {client.gstIn ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              background: 'var(--bg)', color: 'var(--muted)',
                              padding: '3px 10px', borderRadius: 8,
                              fontSize: '0.72rem', fontWeight: 700,
                              border: '1px solid var(--border)'
                            }}>
                              <Hash size={10} />
                              {client.gstIn}
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              background: 'var(--status-warning-bg)', color: 'var(--status-warning-text)',
                              padding: '3px 10px', borderRadius: 8,
                              fontSize: '0.72rem', fontWeight: 700
                            }}>
                              GST not provided
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <motion.button
                          whileHover={{ scale: 1.1, background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleDeleteClient(e, client.id, client.name)}
                          style={{
                            width: 32, height: 32, borderRadius: 10,
                            background: 'var(--bg)', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--muted)', cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          title="Remove Client"
                        >
                          <Trash2 size={15} />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* ── Add another client CTA ── */}
        {!loading && filtered.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/add-client')}
            style={{
              width: '100%', marginTop: 16, padding: '14px',
              background: 'var(--surface)',
              border: '2px dashed var(--primary)',
              borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, cursor: 'pointer',
              color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem'
            }}
          >
            <Plus size={18} />
            Add Another Client
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Clients;
