import { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp, Package, DollarSign, FileText, Plus, ArrowRight, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import logo from '../assets/logo.jpeg';

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
      <div className="dashboard-sky-bg">
        <div className="wave-container">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>
        <div className="fabric-float">
          <div className="fabric-layer"></div>
        </div>
      </div>

      <div className="page-header" style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: 'none' }}>
        <div className="flex items-center gap-3">
          <div className="dashboard-logo-container">
            <img src={logo} alt="V" className="dashboard-logo-img" />
          </div>
          <div style={{ lineHeight: 1 }}>
            <p style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Portal</p>
            <p style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', margin: '2px 0 0' }}>Vatsalya Lifestyle</p>
          </div>
        </div>
        <div className="flex gap-2">

          <motion.div whileTap={{ scale: 0.9 }} className="profile-avatar-small" onClick={() => navigate('/profile')}>
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
        <motion.div variants={item} className="hero-card" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Welcome back,</p>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '4px 0 0' }}>{firstName} 👋</h1>
            </div>
            <div className="pill" style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}>
              <Zap size={14} fill="white" style={{ marginRight: 4 }} />
              {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
          <p className="mb-8 font-medium" style={{ opacity: 0.9, lineHeight: 1.6 }}>
             Let your business flow like fabric in the air.
          </p>

          <div className="flex gap-3" style={{ marginTop: '10px' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/deals')} className="button button-white" style={{ flex: 1, padding: '12px', fontSize: '0.9rem', background: 'white' }}>
              <Plus size={18} /> New Order
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/inquiries')} className="button button-glass" style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }}>
              Inquiries <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>

        <div className="stats-grid" style={{ marginTop: 0 }}>
          <motion.div variants={item} className="card" style={{ border: 'none', boxShadow: 'var(--shadow-sm)', background: 'rgba(255,255,255,0.8)' }}>
            <p className="card-title">Flow</p>
            <div className="card-row">
              <h3 className="card-value">{loading ? '...' : stats.totalDeals}</h3>
              <div className="card-icon success" style={{ background: '#F0FDF4' }}>
                <FileText size={20} />
              </div>
            </div>
          </motion.div>
          <motion.div variants={item} className="card" style={{ border: 'none', background: 'rgba(255,255,255,0.8)' }}>
            <p className="card-title">Dues</p>
            <div className="card-row">
              <h3 className="card-value" style={{ fontSize: '1.2rem' }}>{loading ? '...' : `₹${(stats.pendingDues/1000).toFixed(1)}k`}</h3>
              <div className="card-icon warning" style={{ background: '#FFFBEB' }}>
                <DollarSign size={20} />
              </div>
            </div>
          </motion.div>
          <motion.div variants={item} className="card" style={{ border: 'none', background: 'rgba(255,255,255,0.8)' }}>
            <p className="card-title">Sales</p>
            <div className="card-row">
              <h3 className="card-value" style={{ fontSize: '1.2rem' }}>{loading ? '...' : `₹${(stats.sales/1000).toFixed(1)}k`}</h3>
              <div className="card-icon info" style={{ background: '#EFF6FF' }}>
                <TrendingUp size={20} />
              </div>
            </div>
          </motion.div>
          <motion.div variants={item} className="card" style={{ border: 'none', background: 'rgba(255,255,255,0.8)' }}>
            <p className="card-title">Alerts</p>
            <div className="card-row">
              <h3 className="card-value">{loading ? '...' : stats.lowStock}</h3>
              <div className="card-icon danger" style={{ background: '#FEF2F2' }}>
                <Package size={20} />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={item} className="section-group">
          <div className="section-head">
            <div className="flex items-center gap-2">
               <div style={{ width: 4, height: 16, background: 'var(--primary)', borderRadius: 2 }}></div>
               <h2 className="font-bold text-dark">Revenue Insights</h2>
            </div>
            <div className="text-[10px] font-black uppercase text-primary tracking-widest">
              Live Analysis
            </div>
          </div>
          <div className="card" style={{ padding: '32px 16px 16px 16px', borderRadius: '30px', border: 'none', boxShadow: 'var(--shadow-sm)', background: 'rgba(255,255,255,0.8)' }}>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }}
                    dy={12}
                  />
                  <YAxis
                    hide={true}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--primary)"
                    strokeWidth={5}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-6 px-2">
               <p className="text-[10px] font-bold text-gray-400">MAY 2024 PERFORMANCE</p>
               <div className="flex items-center gap-1 text-[10px] font-black text-primary">DETAILED AUDIT <ArrowRight size={12} /></div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="section-group" style={{ marginBottom: 40 }}>
          <div className="section-head">
            <h2 className="font-bold text-dark">Activity Log</h2>
            <div className="section-action" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>Full Archive</div>
          </div>
          <div className="card" style={{ padding: 0, border: 'none', borderRadius: '24px', overflow: 'hidden' }}>
             {[
               { title: 'New inquiry: Shree Ram Textiles', time: '2 hours ago', icon: <Activity size={20} />, color: '#4F46E5', bg: '#EEF2FF' },
               { title: 'Payment: Deal #1012 verified', time: '5 hours ago', icon: <DollarSign size={20} />, color: '#10B981', bg: '#ECFDF5' },
               { title: 'Inventory: Cotton Fabric low', time: 'Yesterday', icon: <Zap size={20} />, color: '#F59E0B', bg: '#FFFBEB' }
             ].map((activity, idx) => (
               <div key={idx} className="activity-item" style={{ borderBottom: idx === 2 ? 'none' : '1px solid #F8FAFC' }}>
                 <div className="activity-icon" style={{ backgroundColor: activity.bg, color: activity.color }}>
                   {activity.icon}
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-sm text-dark">{activity.title}</p>
                   <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{activity.time}</p>
                 </div>
                 <ChevronRight size={14} className="text-gray-300" />
               </div>
             ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

