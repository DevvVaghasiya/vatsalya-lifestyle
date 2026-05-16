import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, User, Edit3, Lock,
  LogOut, ChevronRight, Camera, Users, ClipboardList, ShieldCheck,
  Loader2, CheckCircle2, Package, Layers, Sun, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinary';

/**
 * Persist profile picture URL to:
 *   1. localStorage (user object) — for immediate UI updates everywhere
 *   2. Backend DB via PUT /api/users/:id — so it survives across devices/logins
 */
const saveProfilePicture = async (user, url) => {
  // 1. Update localStorage
  const updatedUser = { ...user, profilePictureUrl: url };
  localStorage.setItem('user', JSON.stringify(updatedUser));

  // 2. Dispatch event so Navbar / other components re-read the updated user
  window.dispatchEvent(new Event('userProfileUpdated'));

  // 3. Sync only the URL to backend via dedicated PATCH endpoint
  if (user.id) {
    try {
      await api.patch(
        `/api/users/${user.id}/profile-picture`,
        { profilePictureUrl: url }
      );
    } catch (err) {
      console.warn('Could not sync profile picture to backend:', err.message);
      // Not fatal — localStorage already updated
    }
  }

  return updatedUser;
};

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [uploading, setUploading] = useState(false);

  // Sync theme with body class and localStorage
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Re-read user from localStorage whenever another device/tab syncs it
  // Note: only update user state — never touch uploadDone here
  useEffect(() => {
    const refresh = () => setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    window.addEventListener('userProfileUpdated', refresh);
    return () => {
      window.removeEventListener('userProfileUpdated', refresh);
      // Cleanup dismiss timer on unmount
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const menuItems = user.role === 'ADMIN' ? [
    { icon: Users, label: 'User Management', path: '/', tab: 'users', desc: 'Manage all platform users', color: '#4F46E5' },
    { icon: ClipboardList, label: 'Platform Inquiries', path: '/', tab: 'inquiries', desc: 'View all business inquiries', color: '#0D9488' },
    { 
      icon: isDark ? Sun : Moon, 
      label: isDark ? 'Light Mode' : 'Dark Mode', 
      isTheme: true, 
      desc: isDark ? 'Switch to clear visibility' : 'Switch to eye-comfort view', 
      color: isDark ? '#F59E0B' : '#6366F1' 
    },
    { icon: Layers, label: 'Platform Orders', path: '/', tab: 'orders', desc: 'Track all production orders', color: '#6366F1' },
    { icon: Package, label: 'Global Inventory', path: '/', tab: 'inventory', desc: 'Manage warehouse stock', color: '#F59E0B' },
    { icon: Edit3, label: 'Edit Profile', path: '/profile/edit', desc: 'Update admin details', color: '#7C3AED' },
    { icon: Lock, label: 'Security Settings', path: '/profile/change-password', desc: 'Update your password', color: '#D97706' },
    { icon: LogOut, label: 'Sign Out', isLogout: true, desc: 'Exit admin panel', color: '#EF4444' },
  ] : [
    { icon: User, label: 'My Clients', path: '/clients', desc: 'Browse your client list', color: '#4F46E5' },
    { 
      icon: isDark ? Sun : Moon, 
      label: isDark ? 'Light Mode' : 'Dark Mode', 
      isTheme: true, 
      desc: isDark ? 'Switch to clear visibility' : 'Switch to eye-comfort view', 
      color: isDark ? '#F59E0B' : '#6366F1' 
    },
    { icon: Edit3, label: 'Edit Profile', path: '/profile/edit', desc: 'Update authorized details', color: '#7C3AED' },
    { icon: Lock, label: 'Security Settings', path: '/profile/change-password', desc: 'Secure your login credentials', color: '#D97706' },
    { icon: LogOut, label: 'Sign Out', isLogout: true, desc: 'Terminate current session', color: '#EF4444' },
  ];

  const handleMenuClick = (item) => {
    if (item.isLogout) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } else if (item.isTheme) {
      setIsDark(!isDark);
    } else if (item.path) {
      navigate(item.path, { state: { tab: item.tab } });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image too large (max 10 MB)');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadDone(false);
    // Clear any previous dismiss timer
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      const url = await uploadToCloudinary(file);
      const updatedUser = await saveProfilePicture(user, url);
      setUser(updatedUser);
      setUploadDone(true);
      // Auto-dismiss after 3 seconds using a ref so it survives re-renders
      timerRef.current = setTimeout(() => {
        setUploadDone(false);
        timerRef.current = null;
      }, 3000);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div className="page-header" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button type="button" className="icon-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title" style={{ color: 'var(--text)' }}>Account Center</h1>
        <div className="icon-btn" style={{ color: 'var(--primary)', background: 'var(--primary-soft)', cursor: 'default' }}>
          <ShieldCheck size={20} />
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 100px' }}>

        {/* ── Avatar Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'var(--surface)', borderRadius: 28,
            padding: '36px 24px 28px', textAlign: 'center',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
            marginBottom: 24, position: 'relative', overflow: 'hidden'
          }}
        >
          {/* Decorative blob */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* Avatar with upload overlay */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{ width: 110, height: 110, borderRadius: '50%', margin: '0 auto 16px', position: 'relative', cursor: uploading ? 'not-allowed' : 'pointer' }}
          >
            <img
              src={user.profilePictureUrl || 'https://i.pravatar.cc/150?img=11'}
              alt="Profile"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-lg)' }}
            />

            {/* Uploading spinner overlay */}
            {uploading ? (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={28} color="white" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ position: 'absolute', bottom: 4, right: 4, width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <Camera size={14} color="white" />
              </div>
            )}
          </div>

          {/* Upload feedback */}
          <AnimatePresence>
            {uploadDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--status-success-bg)', border: '1px solid var(--status-success-text)33', borderRadius: 10, padding: '8px 16px', marginBottom: 12 }}
              >
                <CheckCircle2 size={16} color="var(--status-success-text)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-success-text)' }}>Profile picture saved to cloud ✓</span>
              </motion.div>
            )}
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-text)33', borderRadius: 10, padding: '8px 16px', marginBottom: 12 }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-danger-text)' }}>{uploadError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            {user.name || 'Enterprise Partner'}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', background: 'var(--primary-soft)', padding: '4px 12px', borderRadius: 8, letterSpacing: '0.6px' }}>
              {user.role || 'USER'}
            </span>
            {user.id && (
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)' }}>
                ID: #{user.id}
              </span>
            )}
          </div>

          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 500 }}>
            Tap the photo to update your picture
          </p>
        </motion.div>

        {/* ── Menu Section ── */}
        <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginBottom: 12, marginLeft: 4 }}>
          Administration &amp; Security
        </p>

        <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isLogout = item.isLogout;
            return (
              <motion.button
                key={idx}
                variants={itemAnim}
                whileHover={{ scale: 1.01, x: 3 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleMenuClick(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
                  padding: '16px 18px',
                  background: isLogout ? `${item.color}12` : 'var(--surface)',
                  border: `1px solid ${isLogout ? `${item.color}33` : 'var(--border)'}`,
                  borderRadius: 18, cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease', textAlign: 'left'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: isLogout ? item.color : 'var(--text)', lineHeight: 1.2 }}>
                    {item.label}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: '0.78rem', fontWeight: 500, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.desc}
                  </p>
                </div>
                <ChevronRight size={16} color={isLogout ? item.color : '#CBD5E1'} style={{ flexShrink: 0 }} />
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Footer ── */}
        <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.2 }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text)', margin: 0 }}>VATSALYA LIFESTYLE ENTERPRISE</p>
          <p style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text)', margin: '3px 0 0' }}>SECURE MANAGEMENT CONSOLE v1.0.4</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
