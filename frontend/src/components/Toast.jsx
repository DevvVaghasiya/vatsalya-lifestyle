import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, X } from 'lucide-react';

const Toast = ({ show, message, onClose, type = 'success' }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: '90%',
            maxWidth: '400px',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'auto'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22c55e',
                flexShrink: 0
              }}
            >
              {type === 'success' ? <CheckCircle size={24} /> : <Download size={24} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                {message}
              </p>
              <p style={{ margin: '2px 0 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', fontWeight: 500 }}>
                Check your browser's download folder
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
