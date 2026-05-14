import { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp, Package, DollarSign, FileText, Plus, ArrowRight, Activity, Zap, FileCheck, Clock, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import logo from '../assets/logo.jpeg';
import dashboardBg from '../assets/dashboard-bg.png';
import logo3 from '../assets/logo3.png';
import fab1  from '../assets/fabric.jpeg';
import fab2  from '../assets/fabric2.jpeg';
import fab3  from '../assets/fabric3.jpeg';
import fab4  from '../assets/fabric4.jpeg';
import fab5  from '../assets/fabric5.jpeg';
import fab6  from '../assets/fabric6.jpeg';
import fab7  from '../assets/fabric7.jpeg';
import fab8  from '../assets/fabric8.jpeg';
import fab9  from '../assets/fabric9.jpeg';
import fab10 from '../assets/fabric10.jpeg';
import fab11 from '../assets/fabric11.jpeg';
import fab12 from '../assets/fabric12.jpeg';
import fab13 from '../assets/fabric13.jpeg';
import fab14 from '../assets/fabric14.jpeg';
import fab15 from '../assets/fabric15.jpeg';
import fab16 from '../assets/fabric16.jpeg';

// Row 1: fab1–fab8, Row 2: fab9–fab16 (no overlap between rows)
const row1Images = [fab1, fab2, fab3, fab4, fab5, fab6, fab7, fab8];
const row2Images = [fab9, fab10, fab11, fab12, fab13, fab14, fab15, fab16];

const data = [
  { name: '1 May', sales: 22000 },
  { name: '10 May', sales: 45000 },
  { name: '15 May', sales: 40000 },
  { name: '20 May', sales: 80000 },
  { name: '25 May', sales: 55000 },
  { name: '31 May', sales: 110000 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const firstName = user.name ? user.name.split(' ')[0] : 'Partner';

  // Sync avatar when profile picture is changed on Profile page
  useEffect(() => {
    const sync = () => setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    window.addEventListener('userProfileUpdated', sync);
    return () => window.removeEventListener('userProfileUpdated', sync);
  }, []);


  const [stats, setStats] = useState({
    totalDeals: 0,
    pendingDues: 0,
    sales: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api
      .get(`/api/dashboard/stats`)
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="page-shell">
      <div className="dashboard-sky-bg" style={{ 
        backgroundImage: `url(${dashboardBg})`,
        backgroundPosition: 'center top',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        zIndex: 0
      }}>
        <div className="wave-container">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>
        <div className="fabric-float">
          <div className="fabric-layer"></div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

      <div className="page-header" style={{
        padding: '18px 24px',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
      }}>
        <div className="flex items-center gap-4">
          <div className="dashboard-logo-container" style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <img src={logo} alt="V" className="dashboard-logo-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <p style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--primary)', margin: 0, letterSpacing: '1.5px' }}>Vatsalya Lifestyle LLP</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="profile-avatar-small"
            onClick={() => navigate('/profile')}
            style={{ border: '2px solid white', boxShadow: 'var(--shadow-sm)', width: '52px', height: '52px' }}
          >
            <img src={user.profilePictureUrl || 'https://i.pravatar.cc/150?img=11'} alt="User" />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="main-content"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="hero-card" style={{
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: '32px',
          padding: '24px', // Reduced padding for better mobile fit
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
        }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[2px] text-primary mb-1">Authenticated Access</p>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#1E293B', margin: 0, letterSpacing: '-1px' }}>Hi, {firstName} 👋</h1>
            </div>
            <div className="pill" style={{
              background: 'transparent',
              color: '#1E293B',
              fontWeight: '800',
              fontSize: '10px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              gap: '2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} color="var(--primary)" />
                {now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </div>
          </div>
          <p className="mb-8 font-semibold text-[#64748B]" style={{ fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '300px' }}>
             Textiles That Define Your Vision.
          </p>

          <div className="flex gap-5">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/deals')}
              className="button"
              style={{ flex: 1, padding: '18px', fontSize: '1rem', fontWeight: '700', background: 'var(--primary)', color: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.2)' }}
            >
              <Plus size={22} style={{ marginRight: 8 }} /> New Order
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/inquiries')}
              className="button"
              style={{ flex: 1, padding: '18px', fontSize: '1rem', fontWeight: '700', background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}
            >
              Recent Inquiries <ArrowRight size={22} style={{ marginLeft: 8 }} />
            </motion.button>
          </div>
        </motion.div>

        <div className="stats-grid" style={{ marginTop: 24, gap: '20px' }}>
          {[
            { label: 'Completed Orders', value: stats.completedOrders, icon: FileCheck, color: '#10B981', bg: '#ECFDF5', path: '/deals', tab: 'completed' },
            { label: 'Delayed Orders', value: stats.delayedOrders, icon: Clock, color: '#EF4444', bg: '#FEF2F2', path: '/deals', tab: 'delayed' },
            { label: 'Ongoing Inquiries', value: stats.ongoingInquiries, icon: Activity, color: '#4F46E5', bg: '#EEF2FF', path: '/inquiries', tab: 'ongoing' },
            { label: 'Completed Inquiries', value: stats.completedInquiries, icon: CheckCircle, color: '#06B6D4', bg: '#ECFEFF', path: '/inquiries', tab: 'completed' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(stat.path, { state: { tab: stat.tab } })}
              className="card"
              style={{
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '20px',
                cursor: 'pointer'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="card-icon" style={{ background: stat.bg, color: stat.color, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={20} />
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: stat.color, background: `${stat.color}15`, padding: '4px 8px', borderRadius: '6px' }}></div>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1E293B', margin: '4px 0 0' }}>{loading ? '...' : stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item} className="section-group" style={{ marginTop: 24 }}>
          <div className="card" style={{
            padding: '32px 0',
            borderRadius: '32px',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Fade effect at edges */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '120px', height: '100%', background: 'linear-gradient(to right, rgba(255,255,255,0.9), transparent)', zIndex: 10 }}></div>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '100%', background: 'linear-gradient(to left, rgba(255,255,255,0.9), transparent)', zIndex: 10 }}></div>

            <div style={{ position: 'relative' }}>
              {/* Row 1: Moving Right to Left */}
              <div className="flex mb-6" style={{ overflow: 'hidden' }}>
                <motion.div
                  animate={{ x: [0, -1400] }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="flex gap-6 px-4"
                >
                  {[...row1Images, ...row1Images].map((src, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, y: -5 }}
                      style={{
                        width: '200px',
                        height: '140px',
                        flexShrink: 0,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                        border: '4px solid white',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={src}
                        alt="fabric"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Row 2: Moving Left to Right */}
              <div className="flex mb-4" style={{ overflow: 'hidden' }}>
                <motion.div
                  animate={{ x: [-1400, 0] }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                  className="flex gap-6 px-4"
                >
                  {[...row2Images, ...row2Images].map((src, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, y: -5 }}
                      style={{
                        width: '200px',
                        height: '140px',
                        flexShrink: 0,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                        border: '4px solid white',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={src}
                        alt="fabric"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>


          </div>
        </motion.div>

        {/* Logo + URL below carousel */}
        <motion.div
          variants={item}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 32,
            marginBottom: 40,
            gap: 16,
          }}
        >
          {/* Logo card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.7)',
              borderRadius: '28px',
              padding: '28px 40px 20px',
              boxShadow: '0 20px 60px rgba(79,70,229,0.08), 0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              maxWidth: '420px',
              width: '100%',
            }}
          >
            <img
              src={logo3}
              alt="Vatsalya Lifestyle LLP"
              style={{
                maxWidth: '320px',
                width: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 24px rgba(79,70,229,0.15))',
              }}
            />

            {/* Divider */}
            <div style={{
              width: '60px',
              height: '2px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
              opacity: 0.4,
            }} />

            {/* URL link */}
            <motion.a
              href="https://www.vatsalyalifestyle.co.in"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '12px',
                fontWeight: '700',
                color: '#4F46E5',
                textDecoration: 'none',
                letterSpacing: '0.6px',
                padding: '8px 18px',
                borderRadius: '100px',
                background: 'rgba(79,70,229,0.07)',
                border: '1px solid rgba(79,70,229,0.15)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(79,70,229,0.12)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(79,70,229,0.07)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              www.vatsalyalifestyle.co.in
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

