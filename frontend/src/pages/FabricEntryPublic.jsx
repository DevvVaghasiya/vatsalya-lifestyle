import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';


const Item = ({ label, value }) => (
  <div style={{ marginBottom: 12 }}>
    <p style={{ margin: 0, fontSize: 12, color: '#64748B', fontWeight: 700 }}>{label}</p>
    <p style={{ margin: '4px 0 0', fontSize: 16, color: '#1E293B', fontWeight: 600 }}>{value || 'N/A'}</p>
  </div>
);

const FabricEntryPublic = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/inventory/${id}`);
        setEntry(res.data || null);
      } catch {
        setError('Fabric entry not found');
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error || !entry) return <div style={{ padding: 24 }}>{error || 'No data found'}</div>;


  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: 16 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
        <h2 style={{ margin: 0, color: '#1E293B' }}>VATSALYA LIFESTYLE LLP</h2>
        <p style={{ margin: '6px 0 20px', color: '#64748B' }}>Fabric Entry Verification</p>

        <Item label="Reference No" value={entry.referenceNo} />
        <Item label="Fabric Name" value={entry.fabricName} />
        <Item label="Composition" value={entry.composition} />
        <Item label="GSM" value={entry.gsm} />
        <Item label="Width" value={entry.width} />
        <Item label="Fabric Type" value={entry.fabricType} />
        <Item label="Count / Const" value={entry.countConst} />
        <Item label="Remark" value={entry.remark} />
      </div>
    </div>
  );
};

export default FabricEntryPublic;
