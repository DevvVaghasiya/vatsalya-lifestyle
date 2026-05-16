import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Layers, MessageSquare, Package, Users, 
  ChevronLeft, ChevronRight, LayoutGrid, Settings,
  LogOut, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('sidebarCollapsed') === 'true');
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/deals', icon: Layers, label: 'Orders' },
    { path: '/inquiries', icon: MessageSquare, label: 'Inquiries' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/clients', icon: Users, label: 'Clients' },
  ];

  // Add Admin Console if user is ADMIN
  const isAdmin = user.role === 'ADMIN';
  const sidebarItems = isAdmin 
    ? [...navItems, { path: '/admin-dashboard', icon: LayoutGrid, label: 'Admin Console' }]
    : navItems;

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="modern-sidebar"
    >
      {/* Sidebar Header / Logo area */}
      <div className="sidebar-header">
        <div className="sidebar-logo-wrapper">
          <div className="sidebar-logo-icon">
            <Shield size={24} className="text-primary" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="sidebar-logo-text"
              >
                <span className="logo-main">VATSALYA</span>
                <span className="logo-sub">Lifestyle LLP</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-toggle-btn"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-link-icon">
                <item.icon size={20} />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="sidebar-link-text"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="active-indicator"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        
        <div className="sidebar-user-section">
          <div 
            className="sidebar-avatar"
            onClick={() => navigate('/profile')}
          >
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sidebar-user-info"
              >
                <p className="user-name">{user.name || 'User'}</p>
                <p className="user-role">{user.role || 'Partner'}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <button 
              onClick={handleLogout}
              className="sidebar-logout-icon-btn"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
