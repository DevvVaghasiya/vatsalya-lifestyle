/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, ChevronRight, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const Deals = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'ongoing');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders`);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const mapStatus = (item) => {
    const status = item.status;
    if (!status) return 'Ongoing';
    const normalized = status.toLowerCase();

    if (normalized === 'completed') return 'Completed';
    if (normalized === 'canceled' || normalized === 'cancelled') return 'Canceled';
    if (normalized === 'delayed') return 'Delayed';

    // Check if Ongoing but Date passed
    if (item.completionDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completion = new Date(item.completionDate);
      if (completion < today && (['pending', 'processing'].includes(normalized))) {
        return 'Delayed';
      }
    }

    if (['pending', 'processing'].includes(normalized)) return 'Ongoing';
    return 'Ongoing';
  };

  const filteredOrders = orders.filter((item) => {
    const statusGroup = mapStatus(item);
    const matchesTab = activeTab === 'all' ? true : statusGroup.toLowerCase() === activeTab;
    const search = (searchTerm || '').toLowerCase();
    const searchMatches =
      (item.client?.name || '').toLowerCase().includes(search) ||
      (item.styleNo || '').toLowerCase().includes(search) ||
      (item.bookingReferenceNo || '').toLowerCase().includes(search) ||
      (item.quality || '').toLowerCase().includes(search);
    return matchesTab && searchMatches;
  });

  const getStatusStyles = (item) => {
    const normalized = mapStatus(item).toLowerCase();
    switch (normalized) {
      case 'ongoing':
        return { bg: '#EEF2FF', color: '#4F46E5' };
      case 'completed':
        return { bg: '#DCFCE7', color: '#166534' };
      case 'canceled':
        return { bg: '#FEE2E2', color: '#B91C1C' };
      case 'delayed':
        return { bg: '#FEF2F2', color: '#EF4444' };
      default:
        return { bg: '#E2E8F0', color: '#475569' };
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div onClick={() => navigate('/')} className="icon-btn">
            <ArrowLeft size={20} />
          </div>
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-subtitle">Production</p>
          </div>
        </div>
        <button onClick={() => navigate('/add-order')} className="icon-btn" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
          <Plus size={18} />
        </button>
      </div>

      <div className="page-container">
        <div className="main-content" style={{ padding: '20px' }}>

          <div className="search-container">
            <Search size={18} color="#64748B" />
            <input
              type="text"
              placeholder="Search by client, style or ref no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="tabs-row">
            {['ongoing', 'delayed', 'completed', 'canceled'].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          <div className="flex-col gap-4">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
                <div className="spinner" style={{ marginBottom: '12px' }}></div>
                <p>Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 40px',
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '2px dashed #E2E8F0'
              }}>
                <MessageSquare size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                <p style={{ color: '#64748B', fontWeight: '500' }}>No {activeTab} orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusStyle = getStatusStyles(order);
                const dispatchTotal = (order.dispatchQuantityReceivedEntries || []).reduce((sum, entry) => sum + (entry.quantity || 0), 0);

                return (
                  <div
                    key={order.id}
                    className="card"
                    onClick={() => navigate(`/deal-detail/${order.id}`)}
                    style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    {/* Order ID at top */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ID: #{order.id}
                      </span>
                      <div style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        textTransform: 'uppercase'
                      }}>
                        {mapStatus(order)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ flex: 1.5 }}>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Customer</p>
                        <h3 style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: '800', color: '#1E293B' }}>{order.client?.name || 'N/A'}</h3>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Style No</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{order.styleNo || 'N/A'}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Booking</p>
                        <p style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: '800', color: '#1E293B' }}>{order.bookingQuantity || '0'} <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>mtr</span></p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Dispatch</p>
                        <p style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: '800', color: '#FBBF24' }}>{dispatchTotal} <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>mtr</span></p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Delivery</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>
                          {order.completionDate ? new Date(order.completionDate).toLocaleDateString('en-GB') : 'Not specified'}
                        </p>
                      </div>
                      <div style={{ color: '#CBD5E1' }}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deals;
