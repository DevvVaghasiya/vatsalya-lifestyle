import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Package, MessageSquare, Home, Users, LogOut, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.jpeg';

const DesktopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
  const isAdmin = user.role === 'ADMIN';

  // Re-read user whenever Profile.jsx dispatches a picture update
  useEffect(() => {
    const sync = () => setUser(JSON.parse(sessionStorage.getItem('user') || '{}'));
    window.addEventListener('userProfileUpdated', sync);
    return () => window.removeEventListener('userProfileUpdated', sync);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="premium-desktop-header">
      <div className="header-inner">
        {/* Brand Logo Section */}
        <div className="brand-section" onClick={() => navigate('/')}>
          <div className="logo-img-container">
            <img src={logo} alt="Vatsalya Logo" className="brand-logo-img" />
          </div>
          <div className="brand-titles">
            <span className="brand-name">VATSALYA</span>
            <span className="brand-tagline">Lifestyle LLP</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <NavLink to="/" className={({ isActive }) => `header-nav-link ${isActive && location.pathname === '/' ? 'active' : ''}`}>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/deals" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            <Layers size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink to="/inquiries" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={18} />
            <span>Inquiries</span>
          </NavLink>

          <NavLink to="/inventory" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            <Package size={18} />
            <span>Inventory</span>
          </NavLink>

          <NavLink to="/clients" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Clients</span>
          </NavLink>
        </nav>

        {/* Action Controls Section */}
        <div className="header-actions">
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

          <div className="header-divider"></div>

          {/* Quick Icons */}


          {/* User Profile / Logout */}
          <div className="header-profile-group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/profile')}
              className="header-avatar"
            >
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="User" />
              ) : (
                <div style={{ 
                  width: '100%', height: '100%', 
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.9rem'
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
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
