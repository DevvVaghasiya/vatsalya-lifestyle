import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Package, MessageSquare, Home, Users, Bell, LogOut, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const DesktopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const isAdmin = user.role === 'ADMIN';

  // Re-read user whenever Profile.jsx dispatches a picture update
  useEffect(() => {
    const sync = () => setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    window.addEventListener('userProfileUpdated', sync);
    return () => window.removeEventListener('userProfileUpdated', sync);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="premium-desktop-header">
      <div className="header-inner">
        {/* Brand Logo Section */}
        <div className="brand-section" onClick={() => navigate('/')}>
          <div className="logo-cube">
            <span className="logo-letter">V</span>
            <div className="cube-glow"></div>
          </div>
          <div className="brand-titles">
            <span className="brand-name">VATSALYA</span>
            <span className="brand-tagline">Lifestyle Enterprise</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <NavLink to="/" className={({ isActive }) => `header-nav-link ${isActive && location.pathname === '/' ? 'active' : ''}`}>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          {!isAdmin && (
            <NavLink to="/deals" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
              <Layers size={18} />
              <span>Orders</span>
            </NavLink>
          )}

          <NavLink to="/inquiries" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={18} />
            <span>Inquiries</span>
          </NavLink>

          {!isAdmin && (
            <NavLink to="/inventory" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
              <Package size={18} />
              <span>Inventory</span>
            </NavLink>
          )}

          <NavLink to="/clients" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Clients</span>
          </NavLink>
        </nav>

        {/* Action Controls Section */}
        <div className="header-actions">
          {!isAdmin ? (
            <div className="create-dropdown">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/add-order')}
                className="btn-header-create"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>New Order</span>
              </motion.button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/add-inquiry')}
              className="btn-header-create"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Inquiry</span>
            </motion.button>
          )}

          <div className="header-divider"></div>

          {/* Quick Icons */}
          <motion.button 
            whileHover={{ scale: 1.08 }} 
            whileTap={{ scale: 0.92 }} 
            onClick={() => navigate('/notifications')} 
            className="header-icon-btn"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notification-dot"></span>
          </motion.button>

          {/* User Profile / Logout */}
          <div className="header-profile-group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/profile')}
              className="header-avatar"
            >
              <img src={user.profilePictureUrl || 'https://i.pravatar.cc/150?img=11'} alt="User" />
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.08 }} 
              whileTap={{ scale: 0.92 }} 
              onClick={handleLogout} 
              className="header-logout-btn"
              title="Sign Out"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
