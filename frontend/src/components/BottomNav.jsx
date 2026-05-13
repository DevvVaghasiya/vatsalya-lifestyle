import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, Package, MessageSquare, MoreHorizontal, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'ADMIN';

  return (
    <nav className="premium-bottom-nav">
      {/* Absolute floating primary Action Trigger above the bar */}
      <div className="mobile-floating-trigger">
        <motion.div 
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(isAdmin ? '/add-inquiry' : '/add-order')}
          className="bottom-nav-fab"
          title={isAdmin ? "Add Inquiry" : "New Order"}
        >
          <Plus size={28} strokeWidth={3} color="white" />
          <div className="fab-glow"></div>
        </motion.div>
      </div>

      <div className="bottom-nav-container">
        <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive && location.pathname === '/' ? 'active' : ''}`}>
          <Home size={20} strokeWidth={2.5} />
          <span>Home</span>
        </NavLink>

        {!isAdmin ? (
          <>
            <NavLink to="/deals" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <Layers size={20} strokeWidth={2.5} />
              <span>Orders</span>
            </NavLink>

            <NavLink to="/inventory" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <Package size={20} strokeWidth={2.5} />
              <span>Inventory</span>
            </NavLink>

            <NavLink to="/inquiries" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <MessageSquare size={20} strokeWidth={2.5} />
              <span>Inquiry</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/inquiries" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <MessageSquare size={20} strokeWidth={2.5} />
              <span>Inquiries</span>
            </NavLink>

            <NavLink to="/clients" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <Package size={20} strokeWidth={2.5} />
              <span>Clients</span>
            </NavLink>
          </>
        )}

        <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <MoreHorizontal size={20} strokeWidth={2.5} />
          <span>More</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
