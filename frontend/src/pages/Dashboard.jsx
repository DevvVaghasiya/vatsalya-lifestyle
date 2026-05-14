import { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp, Package, DollarSign, FileText, Plus, ArrowRight, Activity, Zap, FileCheck, Clock, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import logo from '../assets/logo.jpeg';
import dashboardBg from '../assets/dashboard-bg.png';

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
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <Zap size={10} color="var(--primary)" style={{ marginRight: 4 }} />
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
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
                <div style={{ fontSize: '10px', fontWeight: '800', color: stat.color, background: `${stat.color}15`, padding: '4px 8px', borderRadius: '6px' }}>+12%</div>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1E293B', margin: '4px 0 0' }}>{loading ? '...' : stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item} className="section-group" style={{ marginTop: 32 }}>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <div className="flex items-center gap-3">
               <div style={{ width: 6, height: 24, background: 'var(--primary)', borderRadius: 3 }}></div>
               <h2 className="font-extrabold text-[#1E293B] text-xl">Fabric Collection</h2>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black uppercase text-primary bg-[#4F46E510] px-3 py-1.5 rounded-full tracking-wider">Live Showcase</span>
            </div>
          </div>
          <div className="card" style={{
            padding: '40px 0',
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
                  animate={{ x: [0, -1200] }}
                  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                  className="flex gap-6 px-4"
                >
                  {[...Array(15)].map((_, i) => (
                    <div key={i} style={{ width: '180px', height: '120px', flexShrink: 0, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.08)', border: '4px solid white' }}>
                      <img
                        src={`https://images.unsplash.com/photo-${[
                          '1528459801416-a9e53bbf4e17',
                          '1584184924103-e310d9dc85fc',
                          '1550684848-fac1c5b4e853',
                          '1544441893-675973e31985',
                          '1520004434532-6684162097cf',
                          '1506792006437-256b665541e2'
                        ][i % 6]}?auto=format&fit=crop&w=400&q=80`}
                        alt="fabric"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Row 2: Moving Left to Right */}
              <div className="flex mb-4" style={{ overflow: 'hidden' }}>
                <motion.div
                  animate={{ x: [-1200, 0] }}
                  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                  className="flex gap-6 px-4"
                >
                  {[...Array(15)].map((_, i) => (
                    <div key={i} style={{ width: '180px', height: '120px', flexShrink: 0, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.08)', border: '4px solid white' }}>
                      <img
                        src={`https://images.unsplash.com/photo-${[
                          '1620783770142-023055029ee1',
                          '1441986300917-64674bd600d8',
                          '1556905055-8f358a7a47b2',
                          '1523381210434-271e8be1f52b',
                          '1551488831-00ddcb6c6bd3',
                          '1485230895905-ec40ba36b9bc'
                        ][i % 6]}?auto=format&fit=crop&w=400&q=80`}
                        alt="fabric"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-10 px-10 pt-8 border-t border-[#E2E8F0]">
               <div>
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Our Premium Range</p>
                  <p className="text-sm font-bold text-[#1E293B]">High-Quality Textiles & Fabrics</p>
               </div>
               <motion.div
                 whileHover={{ x: 5 }}
                 className="flex items-center gap-2 text-[11px] font-black text-primary cursor-pointer"
                 onClick={() => navigate('/inventory')}
               >
                 EXPLORE INVENTORY <ArrowRight size={14} />
               </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="section-group" style={{ marginBottom: 60, marginTop: 40 }}>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <h2 className="font-extrabold text-[#1E293B] text-xl">Operational Log</h2>
            <div className="text-[11px] font-black text-primary bg-[#4F46E510] px-4 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-white transition-all uppercase tracking-wider">Historical Archive</div>
          </div>
          <div className="card" style={{
            padding: 0,
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '32px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
          }}>
             {[
               { title: 'New inquiry: Shree Ram Textiles', time: '2 hours ago', icon: <Activity size={18} />, color: '#4F46E5', bg: '#EEF2FF' },
               { title: 'Payment: Deal #1012 verified', time: '5 hours ago', icon: <DollarSign size={18} />, color: '#10B981', bg: '#ECFDF5' },
               { title: 'Inventory: Cotton Fabric low', time: 'Yesterday', icon: <Zap size={18} />, color: '#F59E0B', bg: '#FFFBEB' }
             ].map((activity, idx) => (
               <motion.div
                 key={idx}
                 whileHover={{ background: 'rgba(255,255,255,0.5)' }}
                 className="activity-item"
                 style={{
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    borderBottom: idx === 2 ? 'none' : '1px solid rgba(226, 232, 240, 0.5)',
                    cursor: 'pointer'
                 }}
               >
                 <div className="activity-icon" style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    backgroundColor: activity.bg,
                    color: activity.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                 }}>
                   {activity.icon}
                 </div>
                 <div className="flex-1">
                   <p className="font-extrabold text-[14px] text-[#1E293B] mb-0.5">{activity.title}</p>
                   <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">{activity.time}</p>
                 </div>
                 <ChevronRight size={16} className="text-[#CBD5E1]" />
               </motion.div>
             ))}
          </div>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

