import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import { Package, ShieldCheck, Calendar, Info, Ruler, Layers } from 'lucide-react';

const PublicInventoryView = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/inventory/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error('Error fetching inventory item:', err);
        setError('Item not found or server unreachable.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
      <p style={{ color: '#64748B', fontWeight: '600' }}>Verifying Authenticity...</p>
    </div>
  );

  if (error || !item) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '40px', textAlign: 'center' }}>
      <p style={{ color: '#EF4444', fontSize: '1.2rem', fontWeight: '800' }}>Verification Failed</p>
      <p style={{ color: '#64748B', marginTop: '10px' }}>{error || 'This item could not be found in our registry.'}</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F0F2F5', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>

        {/* Verification Header */}
        <div style={{
          backgroundColor: '#1E293B', borderRadius: '24px', padding: '30px 20px',
          textAlign: 'center', marginBottom: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '60px', height: '60px', backgroundColor: '#10B981', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Authentic Product</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '6px' }}>Vatsalya Lifestyle Certified Inventory</p>
        </div>

        {/* Product Details */}
        <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ backgroundColor: '#EEF2FF', padding: '12px', borderRadius: '14px', color: '#4F46E5' }}>
              <Package size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1E293B' }}>{item.fabricName}</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Ref: {item.referenceNo || 'N/A'}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <DetailBox label="GSM" value={item.gsm} icon={Info} />
            <DetailBox label="Width" value={item.width} icon={Ruler} />
            <DetailBox label="Composition" value={item.composition} icon={Layers} full />
            <DetailBox label="Fabric Type" value={item.fabricType} icon={Package} />
            <DetailBox label="Count/Const" value={item.countConst} icon={Info} />
          </div>

          <div style={{
            marginTop: '30px', padding: '20px', borderRadius: '18px',
            backgroundColor: '#F8FAFC', border: '1px dashed #E2E8F0', textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Registry Status</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', fontWeight: '800', color: '#10B981' }}>VERIFIED & ACTIVE</p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '30px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '600' }}>
          © 2024 Vatsalya Lifestyle LLP. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

const DetailBox = ({ label, value, icon: Icon, full = false }) => (
  <div style={{ gridColumn: full ? 'span 2' : 'span 1' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <Icon size={14} color="#94A3B8" />
      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>{label}</span>
    </div>
    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>{value || 'N/A'}</p>
  </div>
);

export default PublicInventoryView;
