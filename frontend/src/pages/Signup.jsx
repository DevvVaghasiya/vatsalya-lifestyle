import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const fieldStyle = {
  width: '100%', padding: '14px 16px 14px 44px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14, color: 'white',
  fontSize: '0.95rem', fontWeight: 600,
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const iconWrap = {
  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
  color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center'
};

const Signup = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`/api/auth/signup`, {
        name, phoneNumber, password, role: 'USER'
      });
      // Don't auto-login — show pending approval screen
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data || 'Failed to create partner account.');
    } finally {
      setLoading(false);
    }
  };

  const FocusBorder = (e) => { e.target.style.borderColor = 'rgba(79,70,229,0.7)'; };
  const BlurBorder  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; };

  const benefits = [
    'Real-time inventory management',
    'Client & inquiry tracking',
    'PDF order reports & export',
  ];

  /* ── Pending approval screen ── */
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', width: '100%',
        background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: '"Inter", sans-serif',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%', maxWidth: 440, textAlign: 'center',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 32, padding: '48px 36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)'
          }}
        >
          {/* Animated clock icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.3))',
              border: '2px solid rgba(165,180,252,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px'
            }}
          >
            <Clock size={40} color="#A5B4FC" />
          </motion.div>

          <h1 style={{ margin: '0 0 12px', fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
            Awaiting Approval
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500, lineHeight: 1.6 }}>
            Your registration request has been submitted.<br />
            An admin will review and approve your account shortly.
          </p>

          <div style={{
            background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.3)',
            borderRadius: 16, padding: '16px 20px', marginBottom: 28, textAlign: 'left'
          }}>
            {[
              'You will be notified once approved',
              'Do not create another account',
              'Contact admin if urgent access needed',
            ].map(txt => (
              <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, lastChild: { marginBottom: 0 } }}>
                <CheckCircle2 size={14} color="#A5B4FC" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{txt}</span>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              border: 'none', borderRadius: 14, color: 'white',
              fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(79,70,229,0.35)'
            }}
          >
            Back to Sign In
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', fontFamily: '"Inter", sans-serif',
      position: 'relative', overflowY: 'auto'
    }}>
      <style>{`
        body { background: #0F0C29 !important; }
      `}</style>
      {/* Dynamic Background Elements */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: '55vw', height: '55vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
        animation: 'float 22s infinite alternate'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '45vw', height: '45vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
        animation: 'float 28s infinite alternate-reverse'
      }} />

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -50px) scale(1.05); }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: 480,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 28, padding: '36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)'
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', flexShrink: 0
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.8px', lineHeight: 1.1 }}>
              Partner Registration
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Create your enterprise account
            </p>
          </div>
        </div>

        {/* Benefits strip */}
        <div style={{
          background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.25)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 24,
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          {benefits.map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={14} color="#A5B4FC" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{b}</span>
            </div>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                fontSize: '0.85rem', fontWeight: 600, color: '#FCA5A5'
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrap}><User size={17} /></div>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={fieldStyle}
                onFocus={FocusBorder}
                onBlur={BlurBorder}
              />
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Contact Number
            </label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrap}><Phone size={17} /></div>
              <input
                type="tel"
                placeholder="Enter 10-digit contact"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
                style={fieldStyle}
                onFocus={FocusBorder}
                onBlur={BlurBorder}
              />
            </div>
          </div>

          {/* Password field with toggle */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Account Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrap}><Lock size={17} /></div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...fieldStyle, paddingRight: 48 }}
                onFocus={FocusBorder}
                onBlur={BlurBorder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Approval notice */}
          <div style={{
            display: 'flex', gap: 10, padding: '12px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12
          }}>
            <ShieldCheck size={16} color="#A5B4FC" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500, lineHeight: 1.5 }}>
              Your account will be <strong style={{ color: 'rgba(255,255,255,0.7)' }}>reviewed by an admin</strong> before you can log in.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(79,70,229,0.5)' }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px', marginTop: 4,
              background: loading ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: 'none', borderRadius: 16,
              color: 'white', fontWeight: 800, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 8px 24px rgba(79,70,229,0.35)'
            }}
          >
            {loading
              ? <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
              : 'Request Access'
            }
          </motion.button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            Already approved?{' '}
            <Link to="/login" style={{ color: '#A5B4FC', fontWeight: 800, textDecoration: 'none' }}>
              Secure Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
