import { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, ArrowRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const AccessCodeModal = ({ isOpen, onCodeEntered }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Save to database
      await api.patch(`/api/users/${user.id}/access-code`, { accessCode: fullCode });
      
      // Update local storage
      localStorage.setItem('accessCode', fullCode);
      
      onCodeEntered(fullCode);
    } catch (err) {
      console.error('Error saving access code:', err);
      setError('Failed to sync workspace code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.join('').length === 4) {
      handleSubmit();
    }
  }, [code]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: 'white', borderRadius: 32, width: '100%', maxWidth: 420,
          padding: '40px 32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Background Decor */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.05)', pointerEvents: 'none' }} />
        
        <div style={{
          width: 72, height: 72, borderRadius: 24, background: 'var(--primary-soft)',
          color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', position: 'relative'
        }}>
          <Lock size={32} strokeWidth={2.5} />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#10B981', border: '3px solid white' }}
          />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Workspace Access
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.92rem', fontWeight: 500, lineHeight: 1.6, marginBottom: 32 }}>
          Enter your 4-digit code to access your team's inquiries, orders, and inventory.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          {code.map((digit, i) => (
            <input
              key={i}
              id={`code-input-${i}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              style={{
                width: 60, height: 72, borderRadius: 16, border: `2px solid ${digit ? 'var(--primary)' : '#E2E8F0'}`,
                textAlign: 'center', fontSize: '1.75rem', fontWeight: 800,
                color: 'var(--primary)', background: digit ? 'var(--primary-soft)' : '#F8FAFC',
                transition: 'all 0.2s', outline: 'none',
                boxShadow: digit ? '0 0 0 4px rgba(79, 70, 229, 0.1)' : 'none'
              }}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, marginBottom: 24
              }}
            >
              <ShieldAlert size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleSubmit}
          disabled={loading || code.join('').length !== 4}
          style={{
            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.3s', opacity: (loading || code.join('').length !== 4) ? 0.7 : 1,
            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
          }}
        >
          {loading ? (
            <div className="spinner" style={{ width: 20, height: 20, borderTopColor: 'white' }} />
          ) : (
            <>Sync Workspace <ArrowRight size={18} /></>
          )}
        </button>

        <p style={{ marginTop: 24, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
          <KeyRound size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Secure 256-bit workspace isolation enabled.
        </p>
      </motion.div>
    </div>
  );
};

export default AccessCodeModal;
