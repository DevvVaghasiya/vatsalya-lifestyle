import React from 'react';
import { ArrowLeft, CreditCard, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Reminder',
      message: 'Shree Ram Textiles payment of ₹45,000 is due',
      time: '2m ago',
      icon: <CreditCard size={18} color="var(--danger)" />,
      bgColor: 'var(--danger-light)'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Low Stock Alert',
      message: 'Cotton Fabric stock is running low',
      time: '5m ago',
      icon: <AlertTriangle size={18} color="var(--warning)" />,
      bgColor: 'var(--warning-light)'
    },
    {
      id: 3,
      type: 'update',
      title: 'Deal Update',
      message: 'Deal #1011 status changed to Processing',
      time: '18m ago',
      icon: <FileText size={18} color="var(--info)" />,
      bgColor: 'var(--info-light)'
    },
    {
      id: 4,
      type: 'success',
      title: 'Payment Received',
      message: 'Payment of ₹25,000 received from Mahalaxmi Fabrics',
      time: '18m ago',
      icon: <CheckCircle size={18} color="var(--success)" />,
      bgColor: 'var(--success-light)'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="header">
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1>Notifications</h1>
        <div style={{ width: 24 }}></div>
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        {notifications.map((notif) => (
          <div key={notif.id} className="flex gap-4 mb-4" style={{ padding: '16px', backgroundColor: 'var(--white)', borderRadius: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: notif.bgColor, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              {notif.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-dark text-sm">{notif.title}</h4>
                <span className="text-xs text-light">{notif.time}</span>
              </div>
              <p className="text-xs text-gray" style={{ lineHeight: '1.4' }}>{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ padding: '20px' }}>
        <button className="btn btn-primary">Mark all as read</button>
      </div>
    </div>
  );
};

export default Notifications;
