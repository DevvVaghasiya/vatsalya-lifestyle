/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Plus, Package, Layers, FileText, X, Trash2, Printer, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_PATH = '/api/inventory';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB');
  } catch { return dateStr; }
};

const toNumberOrNull = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};




/**
 * Opens a new browser window with a compact fabric sticker and triggers print.
 * No file is downloaded — the user prints directly.
 */
const printFabricSticker = (item) => {
  const fields = [
    ['Reference No', item.referenceNo],
    ['Fabric Name',  item.fabricName],
    ['Composition',  item.composition],
    ['GSM',          item.gsm],
    ['Width',        item.width],
    ['Fabric Type',  item.fabricType],
    ['Count / Const',item.countConst],
    ['Remark',       item.remark],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');

  const rows = fields.map(([label, value]) => `
    <tr>
      <td class="label">${label}</td>
      <td class="value">${value}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Fabric Sticker — ${item.fabricName || ''}</title>
  <style>
    @page {
      size: 100mm 150mm;
      margin: 0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: white;
      width: 100mm;
      min-height: 150mm;
      padding: 0;
    }

    .sticker {
      width: 100mm;
      min-height: 150mm;
      border: 2px solid #4F46E5;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: #4F46E5;
      padding: 8px 10px;
      text-align: center;
    }
    .header .brand {
      color: white;
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .header .sub {
      color: rgba(255,255,255,0.7);
      font-size: 6.5pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 1px;
    }

    .body { padding: 8px 10px; flex: 1; }

    table {
      width: 100%;
      border-collapse: collapse;
    }
    tr { border-bottom: 1px solid #E2E8F0; }
    tr:last-child { border-bottom: none; }
    td { padding: 5px 4px; vertical-align: top; }
    td.label {
      font-size: 6pt;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      width: 35%;
      padding-top: 6px;
    }
    td.value {
      font-size: 9pt;
      font-weight: 700;
      color: #1E293B;
    }

    .footer {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 5px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer .id {
      font-size: 6pt;
      color: #94A3B8;
      font-weight: 700;
    }
    .footer .badge {
      background: #FFFBEB;
      color: #D97706;
      font-size: 6pt;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }

    /* Screen preview button */
    .print-btn {
      display: block;
      margin: 10px auto;
      padding: 8px 20px;
      background: #4F46E5;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 10pt;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="sticker">
    <div class="header">
      <div class="brand">VATSALYA LIFESTYLE LLP</div>
      <div class="sub">Fabric Entry Sticker</div>
    </div>
    <div class="body">
      <table>${rows}</table>
    </div>
    <div class="footer">
      <span class="id">ID: ${item.id || 'N/A'}</span>
      <span class="badge">Fabric Entry</span>
    </div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨 Print Sticker</button>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=420,height=600');
  win.document.write(html);
  win.document.close();
};

const Inventory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('STOCK');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [dispatchDate, setDispatchDate] = useState(new Date());
  const [dispatchQty, setDispatchQty] = useState('');
  const [dispatchRemark, setDispatchRemark] = useState('');

  const [formData, setFormData] = useState({
    referenceNo: '',
    fabricName: '',
    composition: '',
    gsm: '',
    width: '',
    fabricType: '',
    countConst: '',
    remark: '',
    stockQuantity: ''
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`${API_PATH}/category/${activeTab}`);
      setItems(res.data || []);
    } catch (err) {
      console.error('Error fetching:', err);
      setError('Unable to connect to server. The backend may be starting up — please retry.');
    }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fabricName) { alert('Please enter fabric name'); return; }
    if (activeTab !== 'FABRIC_ENTRY') {
      if (toNumberOrNull(formData.stockQuantity) === null || toNumberOrNull(formData.stockQuantity) <= 0) {
        alert('Please enter a valid available quantity');
        return;
      }
    }
    setSubmitting(true);
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    try {
      await api.post(API_PATH, {
        ...formData,
        gsm: toNumberOrNull(formData.gsm),
        stockQuantity: activeTab === 'FABRIC_ENTRY' ? null : toNumberOrNull(formData.stockQuantity),
        category: activeTab,
        status: 'available',
        soldQuantity: 0,
        createdBy: currentUser.id ? { id: currentUser.id } : null,
        lastEditedBy: currentUser.id ? { id: currentUser.id } : null
      });
      setShowAddModal(false);
      setFormData({
        referenceNo: '',
        fabricName: '',
        composition: '',
        gsm: '',
        width: '',
        fabricType: '',
        countConst: '',
        remark: '',
        stockQuantity: ''
      });
      fetchItems();
    } catch (err) {
      console.error('Error adding:', err);
      alert('Failed to add item. Server may be starting up — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.delete(`${API_PATH}/${id}`); fetchItems(); }
    catch (err) { console.error('Error deleting:', err); }
  };

  const handleDispatch = async (item) => {
    if (!dispatchQty || Number(dispatchQty) <= 0) { alert('Enter a valid quantity'); return; }
    const available = (item.stockQuantity || 0) - (item.soldQuantity || 0);
    if (Number(dispatchQty) > available) {
      alert(`Cannot add ${dispatchQty}. Only ${available} Mtr available.`);
      return;
    }
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    try {
      await api.post(`${API_PATH}/${item.id}/dispatch`, {
        entryDate: dispatchDate.toISOString().split('T')[0],
        quantity: Number(dispatchQty),
        remark: dispatchRemark
      });
      
      // Update lastEditedBy for the inventory item
      if (currentUser.id) {
        await api.put(`${API_PATH}/${item.id}`, {
          lastEditedBy: { id: currentUser.id }
        });
      }
      setDispatchQty('');
      setDispatchRemark('');
      setDispatchDate(new Date());
      fetchItems();
    } catch (err) {
      console.error('Error updating quantity:', err);
      const msg = err.response?.data?.error || 'Failed to update quantity';
      alert(msg);
    }
  };

  const filtered = items.filter(i =>
    (i.fabricName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.referenceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(i.id).includes(searchTerm.toLowerCase())
  );

  const availableItems = activeTab === 'FABRIC_ENTRY'
    ? filtered
    : filtered.filter(i => i.status === 'available');
  const soldItems = activeTab === 'FABRIC_ENTRY'
    ? []
    : filtered.filter(i => i.status === 'sold');

  const tabs = [
    { key: 'STOCK', label: 'Stock', icon: Package, color: '#4F46E5', bg: '#EEF2FF' },
    { key: 'SAMPLE', label: 'Sample & Yardage', icon: Layers, color: '#0D9488', bg: '#F0FDFA' },
    { key: 'FABRIC_ENTRY', label: 'Fabric Entry', icon: FileText, color: '#D97706', bg: '#FFFBEB' },
  ];
  const currentTab = tabs.find(t => t.key === activeTab);
  const addLabel = { STOCK: 'Add New Stock', SAMPLE: 'Add New Sample', FABRIC_ENTRY: 'Add New Entry' };

  const renderCard = (item) => {
    const isExpanded = expandedCard === item.id;
    const available = (item.stockQuantity || 0) - (item.soldQuantity || 0);
    const dispatched = item.soldQuantity || 0;
    const entries = item.dispatchEntries || [];
    const isFabricEntry = activeTab === 'FABRIC_ENTRY';

    return (
      <div key={item.id} className="inventory-card">
        {/* Card Header */}
        <div className="inventory-card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px', backgroundColor: currentTab.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: currentTab.color, fontWeight: '800', fontSize: '1.1rem', flexShrink: 0
              }}>
                {(item.fabricName || 'F').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1E293B' }}>{item.fabricName}</h4>
                {item.referenceNo && (
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>Ref: {item.referenceNo}</p>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {!isFabricEntry && (
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                  style={{ background: currentTab.bg, border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: currentTab.color }}
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
              {isFabricEntry && (
                <button
                  onClick={() => printFabricSticker(item)}
                  title="Print Sticker"
                  style={{ background: '#FFF7ED', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#C2410C' }}
                >
                  <Printer size={16} />
                </button>
              )}
                <button onClick={() => handleDelete(item.id)}
                  style={{ background: '#FEF2F2', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#EF4444' }}>
                  <Trash2 size={16} />
                </button>
            </div>
          </div>

          {isFabricEntry ? (
            <div className="fabric-details-grid">
                {item.composition && (
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Composition</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>{item.composition}</p>
                  </div>
                )}
                {item.fabricType && (
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Fabric Type</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>{item.fabricType}</p>
                  </div>
                )}
                {item.gsm && (
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>GSM</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>{item.gsm}</p>
                  </div>
                )}
                {item.width && (
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Width</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>{item.width}</p>
                  </div>
                )}
                {item.countConst && (
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Count / Const</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>{item.countConst}</p>
                  </div>
                )}
                {item.remark && (
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Remark</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>{item.remark}</p>
                  </div>
                )}
            </div>
          ) : (
            /* Quick Stats */
            <div className="stats-row">
              <div className="stat-item">
                <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Available</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: '800', color: available > 0 ? '#16A34A' : '#EF4444' }}>{available} Mtr</p>
              </div>
              <div className="stat-item">
                <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Total</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: '700', color: '#1E293B' }}>{item.stockQuantity || 0} Mtr</p>
              </div>
              <div className="stat-item">
                <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Dispatched</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: '700', color: '#D97706' }}>{dispatched} Mtr</p>
              </div>
              {item.gsm && (
                <div className="stat-item">
                  <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>GSM</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: '700', color: '#1E293B' }}>{item.gsm}</p>
                </div>
              )}
              {item.width && (
                <div className="stat-item">
                  <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Width</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: '700', color: '#1E293B' }}>{item.width}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Audit Info */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {item.createdBy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Added By:</p>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>{item.createdBy.name}</p>
              </div>
            )}
            {item.lastEditedBy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <p style={{ margin: 0, fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Edited By:</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>{item.lastEditedBy.name}</p>
              </div>
            )}
          </div>
        </div>

        {!isFabricEntry && isExpanded && (
          <div className="dispatch-section" style={{ borderTopColor: currentTab.color }}>
            <h4 style={{ margin: '0 0 14px', color: currentTab.color, fontWeight: '800', fontSize: '0.95rem' }}>Dispatch Mtr</h4>
            <div className="dispatch-form">
              <div className="dispatch-input-group">
                <p style={{ margin: '0 0 4px', fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>Entry Date</p>
                <DatePicker
                  selected={dispatchDate}
                  onChange={(date) => setDispatchDate(date || new Date())}
                  dateFormat="dd/MM/yyyy"
                  className="form-input"
                  style={{ backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 10px', fontSize: '0.85rem', width: '100%' }}
                />
              </div>
              <div className="dispatch-input-group-small">
                <p style={{ margin: '0 0 4px', fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>Quantity</p>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={dispatchQty}
                  onChange={(e) => setDispatchQty(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div className="dispatch-input-group">
                <p style={{ margin: '0 0 4px', fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>Remark</p>
                <input
                  type="text"
                  placeholder="Enter remark"
                  value={dispatchRemark}
                  onChange={(e) => setDispatchRemark(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#F8FAFC', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <button
              onClick={() => handleDispatch(item)}
              style={{
                padding: '10px 18px', borderRadius: '12px', border: 'none',
                backgroundColor: currentTab.color, color: 'white', fontWeight: '700',
                fontSize: '0.85rem', cursor: 'pointer', marginBottom: '18px'
              }}
            >
              Add Dispatch Receipt
            </button>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <h4 style={{ margin: '0 0 10px', color: '#1E293B', fontWeight: '700', fontSize: '0.9rem' }}>Received Quantity History</h4>
              {entries.length === 0 ? (
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>No dispatch receipt entries yet.</p>
              ) : (
                <>
                  {entries.map((entry, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 0', borderBottom: idx < entries.length - 1 ? '1px solid #E2E8F0' : 'none'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ color: '#64748B', fontSize: '0.85rem' }}>{formatDate(entry.entryDate)}</span>
                        {entry.remark && <span style={{ color: '#475569', fontSize: '0.8rem', marginLeft: '12px' }}>• {entry.remark}</span>}
                      </div>
                      <span style={{ fontWeight: '700', color: '#1E293B' }}>{entry.quantity} Mtr</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #E2E8F0', marginTop: '6px' }}>
                    <span style={{ color: '#64748B', fontWeight: '700' }}>Dispatch Qty</span>
                    <span style={{ color: '#D97706', fontWeight: '800' }}>{dispatched} Mtr</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inv-page">

      {/* ── Top bar (non-sticky on mobile, clean card) ── */}
      <div className="inv-topbar">
        <div className="inv-topbar-left">
          <button type="button" className="icon-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="page-subtitle">Warehouse</p>
            <h1 className="page-title">Inventory</h1>
          </div>
        </div>
        <div className="search-container inv-search">
          <Search size={18} color="#64748B" />
          <input
            type="text"
            placeholder="Search by name or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* ── Category Tabs ── always visible ── */}
      <div className="inv-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearchTerm(''); setExpandedCard(null); }}
            className="inv-tab-btn"
            style={{
              border: activeTab === tab.key ? 'none' : `1px solid #E2E8F0`,
              backgroundColor: activeTab === tab.key ? tab.color : 'white',
              color: activeTab === tab.key ? 'white' : tab.color,
              boxShadow: activeTab === tab.key ? `0 8px 20px ${tab.color}33` : 'none',
            }}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inv-add-btn"
          style={{
            border: `2px dashed ${currentTab.color}`,
            backgroundColor: currentTab.bg,
            color: currentTab.color,
          }}
        >
          <Plus size={20} />
          {addLabel[activeTab]}
        </button>

      {/* ── Available Items ── */}
      <div className="inv-section">
        <div className="inv-section-head">
          <div className="inv-section-accent" style={{ backgroundColor: currentTab.color }} />
          <h3 className="inv-section-title">
            {activeTab === 'STOCK' ? 'Available Stock' : activeTab === 'SAMPLE' ? 'Available Samples' : 'Fabric Entries'}
          </h3>
          <span className="inv-section-badge" style={{ backgroundColor: currentTab.bg, color: currentTab.color }}>
            {availableItems.length}
          </span>
        </div>

        {error ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <RefreshCw size={24} color="#EF4444" />
            </div>
            <p style={{ color: '#64748B', fontWeight: '700', margin: '0 0 6px', fontSize: '0.95rem' }}>Connection Issue</p>
            <p style={{ color: '#94A3B8', fontWeight: '500', margin: '0 0 16px', fontSize: '0.82rem', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>{error}</p>
            <button
              onClick={fetchItems}
              style={{
                background: currentTab.color, color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: 12,
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: `0 6px 16px ${currentTab.color}33`
              }}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : loading ? (
          <div className="inventory-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="inventory-card skeleton-card" style={{ 
                minHeight: '160px', 
                background: 'rgba(255,255,255,0.6)', 
                overflow: 'hidden', 
                position: 'relative' 
              }}>
                <div className="shimmer-sweep" />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F1F5F9' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '70%', height: '14px', borderRadius: '4px', backgroundColor: '#F1F5F9', marginBottom: '8px' }} />
                      <div style={{ width: '40%', height: '10px', borderRadius: '4px', backgroundColor: '#F1F5F9' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, height: '32px', borderRadius: '8px', backgroundColor: '#F8FAFC' }} />
                    <div style={{ flex: 1, height: '32px', borderRadius: '8px', backgroundColor: '#F8FAFC' }} />
                    <div style={{ flex: 1, height: '32px', borderRadius: '8px', backgroundColor: '#F8FAFC' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : availableItems.length === 0 ? (
          <div className="inv-empty">
            <currentTab.icon size={40} color="#CBD5E1" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#64748B', fontWeight: '600', margin: 0 }}>No items found</p>
          </div>
        ) : (
          <div className="inventory-grid">
            {availableItems.map(item => renderCard(item))}
          </div>
        )}
      </div>

      {/* ── Sold / Exhausted Items ── */}
      {(activeTab === 'STOCK' || activeTab === 'SAMPLE') && soldItems.length > 0 && (
        <div className="inv-section">
          <div className="inv-section-head">
            <div className="inv-section-accent" style={{ backgroundColor: '#16A34A' }} />
            <h3 className="inv-section-title">
              {activeTab === 'STOCK' ? 'Sold Stock' : 'Sold Samples'}
            </h3>
            <span className="inv-section-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              {soldItems.length}
            </span>
          </div>
          <div className="inventory-grid">
            {soldItems.map(item => renderCard(item))}
          </div>
        </div>
      )}


      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1E293B' }}>{addLabel[activeTab]}</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer' }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Reference No</label>
                <input name="referenceNo" value={formData.referenceNo} onChange={handleChange}
                  placeholder="e.g. REF-001" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fabric Name *</label>
                <input name="fabricName" value={formData.fabricName} onChange={handleChange} required
                  placeholder="e.g. Cotton Satin" style={inputStyle} />
              </div>
              {activeTab === 'STOCK' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>GSM</label>
                    <input name="gsm" value={formData.gsm} onChange={handleChange} type="number"
                      placeholder="e.g. 180" style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Width</label>
                    <input name="width" value={formData.width} onChange={handleChange}
                      placeholder='e.g. 58"' style={inputStyle} />
                  </div>
                </div>
              )}
              {activeTab !== 'FABRIC_ENTRY' ? (
                <div>
                  <label style={labelStyle}>Available Quantity (Mtr)</label>
                  <input name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required
                    type="number" step="0.01" min="0" placeholder="e.g. 500" style={inputStyle} />
                </div>
              ) : (
                <>
                  <div>
                    <label style={labelStyle}>Composition</label>
                    <input name="composition" value={formData.composition} onChange={handleChange}
                      placeholder="e.g. 100% Cotton" style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>GSM</label>
                      <input name="gsm" value={formData.gsm} onChange={handleChange} type="number"
                        placeholder="e.g. 180" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Width</label>
                      <input name="width" value={formData.width} onChange={handleChange}
                        placeholder='e.g. 58"' style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Fabric Type</label>
                    <input name="fabricType" value={formData.fabricType} onChange={handleChange}
                      placeholder="e.g. Woven" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Count / Const</label>
                    <input name="countConst" value={formData.countConst} onChange={handleChange}
                      placeholder="e.g. 40s x 40s" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Remark</label>
                    <input name="remark" value={formData.remark} onChange={handleChange}
                      placeholder="Any notes..." style={inputStyle} />
                  </div>
                </>
              )}
              <button type="submit" disabled={submitting} style={{
                padding: '16px', borderRadius: '16px', border: 'none',
                backgroundColor: submitting ? '#94A3B8' : currentTab.color, color: 'white', fontWeight: '700',
                fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', marginTop: '8px',
                boxShadow: submitting ? 'none' : `0 8px 20px ${currentTab.color}33`,
                opacity: submitting ? 0.7 : 1, transition: 'all 0.2s'
              }}>
                {submitting ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} /> Saving...</>
                ) : (
                  <><Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{addLabel[activeTab]}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' };
const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid #E2E8F0',
  fontSize: '0.95rem', outline: 'none', backgroundColor: '#F8FAFC', color: '#1E293B', boxSizing: 'border-box'
};

export default Inventory;
