import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post(`/api/auth/login`, { phoneNumber, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Access denied. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: '"Inter", sans-serif',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 28, padding: '40px 36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(79,70,229,0.4)',
            fontSize: '1.4rem', fontWeight: 900, color: 'white',
            flexShrink: 0
          }}>
            V
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.3px' }}>
              Vatsalya Lifestyle
            </p>
            <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Enterprise Portal
            </p>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
            Welcome Back
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            Sign in to access the management console
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Phone */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center'
              }}>
                <Phone size={17} />
              </div>
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px 14px 44px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14, color: 'white',
                  fontSize: '0.95rem', fontWeight: 600,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(79,70,229,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center'
              }}>
                <Lock size={17} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 48px 14px 44px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14, color: 'white',
                  fontSize: '0.95rem', fontWeight: 600,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(79,70,229,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
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

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(79,70,229,0.5)' }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px',
              background: loading
                ? 'rgba(79,70,229,0.5)'
                : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: 'none', borderRadius: 16,
              color: 'white', fontWeight: 800, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginTop: 8,
              boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
              transition: 'background 0.2s'
            }}
          >
            {loading ? (
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>Continue to Portal <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            New to the enterprise?{' '}
            <Link to="/signup" style={{ color: '#A5B4FC', fontWeight: 800, textDecoration: 'none' }}>
              Request Partner Access
            </Link>
          </p>
        </div>

        {/* Security badges */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 20, marginTop: 28, paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.07)'
        }}>
          {[['ShieldCheck', 'Secure SSL'], ['Zap', '256-bit Encryption']].map(([, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.3 }}>
              <ShieldCheck size={11} color="white" />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
