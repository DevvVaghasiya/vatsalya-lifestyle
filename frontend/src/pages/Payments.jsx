import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Payments = () => {
  const navigate = useNavigate();

  const transactions = [
    { name: 'Mahalaxmi Fabrics', amount: '₹25,000', date: '20 May 2024', status: 'Paid' },
    { name: 'Shree Ram Textiles', amount: '₹15,000', date: '19 May 2024', status: 'Partial' },
    { name: 'Kiran Fabrics', amount: '₹30,000', date: '18 May 2024', status: 'Due' },
    { name: 'Shyam Textiles', amount: '₹45,000', date: '17 May 2024', status: 'Paid' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <div className="header">
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1>Payments</h1>
        <div style={{ width: 24 }}></div>
      </div>

      <div style={{ padding: '20px' }}>
        <div className="flex gap-4 mb-4">
          <div className="card" style={{ flex: 1, padding: '16px', backgroundColor: 'var(--danger-light)' }}>
            <p className="card-title text-xs" style={{ color: 'var(--danger)' }}>Total Due</p>
            <h3 className="card-value" style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>₹2,45,000</h3>
          </div>
          <div className="card" style={{ flex: 1, padding: '16px', backgroundColor: 'var(--success-light)' }}>
            <p className="card-title text-xs" style={{ color: 'var(--success)' }}>Paid Amount</p>
            <h3 className="card-value" style={{ color: 'var(--success)', fontSize: '1.2rem' }}>₹5,80,000</h3>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="card" style={{ flex: 1, padding: '16px', backgroundColor: 'var(--info-light)' }}>
            <p className="card-title text-xs" style={{ color: 'var(--info)' }}>Total Received</p>
            <h3 className="card-value" style={{ color: 'var(--info)', fontSize: '1.2rem' }}>₹3,35,000</h3>
          </div>
          <div className="card" style={{ flex: 1, padding: '16px', backgroundColor: 'var(--warning-light)' }}>
            <p className="card-title text-xs" style={{ color: 'var(--warning)' }}>Overdue</p>
            <h3 className="card-value" style={{ color: 'var(--warning)', fontSize: '1.2rem' }}>₹1,20,000</h3>
          </div>
        </div>

        <h3 className="font-semibold text-dark mb-4 text-sm">Recent Transactions</h3>
        
        <div className="flex-col gap-3">
          {transactions.map((t, idx) => (
            <div key={idx} className="card flex justify-between items-center" style={{ padding: '16px', marginBottom: '12px' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: t.status === 'Paid' ? 'var(--success-light)' : t.status === 'Partial' ? 'var(--info-light)' : 'var(--danger-light)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: t.status === 'Paid' ? 'var(--success)' : t.status === 'Partial' ? 'var(--info)' : 'var(--danger)' }}>
                    {t.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-dark text-sm">{t.name}</h4>
                  <p className="text-xs text-gray mt-1">{t.date}</p>
                </div>
              </div>
              <h4 className="font-bold text-dark text-sm">{t.amount}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;
