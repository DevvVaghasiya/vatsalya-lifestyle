import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerDetails = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="header">
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1>Customer Details</h1>
        <div style={{ width: 24 }}></div>
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
            ST
          </div>
          <div>
            <h2 className="font-bold text-dark text-lg mb-1">Shree Ram Textiles</h2>
            <p className="text-xs text-gray mb-1">9876543210</p>
            <p className="text-xs text-gray mb-1">shreeramtextiles@gmail.com</p>
            <p className="text-xs text-gray mb-1">Surat, Gujarat</p>
            <p className="text-xs text-gray">GSTIN: 24ABCDE1234F1Z5</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="card" style={{ flex: 1, padding: '16px', backgroundColor: 'var(--info-light)' }}>
            <p className="card-title text-xs" style={{ color: 'var(--info)' }}>Total Deals</p>
            <h3 className="card-value" style={{ color: 'var(--info)' }}>18</h3>
          </div>
          <div className="card" style={{ flex: 1, padding: '16px', backgroundColor: 'var(--success-light)' }}>
            <p className="card-title text-xs" style={{ color: 'var(--success)' }}>Total Purchase</p>
            <h3 className="card-value" style={{ color: 'var(--success)', fontSize: '1.2rem' }}>₹12,45,000</h3>
          </div>
        </div>
        
        <div className="card" style={{ padding: '16px', backgroundColor: 'var(--danger-light)' }}>
          <p className="card-title text-xs" style={{ color: 'var(--danger)' }}>Pending Due</p>
          <h3 className="card-value" style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>₹45,000</h3>
        </div>

      </div>
      
      <div style={{ padding: '20px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/deals')}>View Deal History</button>
      </div>
    </div>
  );
};

export default CustomerDetails;
