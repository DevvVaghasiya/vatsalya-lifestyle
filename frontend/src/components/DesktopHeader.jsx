import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Sun, Moon, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const DesktopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

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

  // Re-read user whenever Profile.jsx dispatches a picture update
  useEffect(() => {
    const sync = () => setUser(JSON.parse(sessionStorage.getItem('user') || '{}'));
    window.addEventListener('userProfileUpdated', sync);
    return () => window.removeEventListener('userProfileUpdated', sync);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  // Map path to title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/admin-dashboard')) return 'Admin Console';
    if (path.startsWith('/deals')) return 'Orders';
    if (path.startsWith('/inquiries')) return 'Inquiries';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/clients')) return 'Clients';
    if (path.startsWith('/profile')) return 'Profile Settings';
    if (path.startsWith('/add-order')) return 'Create New Order';
    if (path.startsWith('/add-inquiry')) return 'Log New Inquiry';
    return 'Textile Management';
  };

  return (
    <header className="premium-desktop-header">
      <div className="header-inner">
        {/* Left: Contextual Title / Breadcrumbs */}
        <div className="header-left">
          <h2 className="header-context-title">{getPageTitle()}</h2>
        </div>

        {/* Center: Search Bar (Global) */}
        <div className="header-search-wrapper">
          <div className="header-search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search anything..." />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="header-actions">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/add-order')}
            className="btn-header-create-pill"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Order</span>
          </motion.button>

          <div className="header-divider"></div>

          {/* Notifications */}
          <button className="header-icon-btn-ghost">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="header-icon-btn-ghost"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
          </motion.button>

          <div className="header-divider"></div>

          {/* Quick Profile Access */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/profile')}
            className="header-avatar-mini"
          >
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="User" />
            ) : (
              <div className="avatar-mini-placeholder">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
