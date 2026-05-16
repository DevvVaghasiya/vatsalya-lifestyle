/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Clock, CheckCircle, XCircle,
  User, Package, Calendar, Info, Hash, Palette,
  Briefcase, Edit3, Save, X, Truck, Layers, Ruler, DollarSign, FileCheck, Download, Trash2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { addPdfHeader } from '../utils/pdfHeader';
import Toast from '../components/Toast';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB');
  } catch {
    return dateStr;
  }
};

const DetailItem = ({ label, value, icon: Icon, name, editable = true, isEditing, editData, onChange, type = "text" }) => (
  <div style={{ flex: 1, display: 'flex', gap: '12px', minWidth: 0 }}>
    <div style={{ backgroundColor: 'var(--bg)', padding: '10px', borderRadius: '12px', height: 'fit-content', flexShrink: 0 }}>
      <Icon size={18} color="var(--primary)" />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      {isEditing && editable ? (
        <input
          type={type}
          name={name}
          value={editData[name] ?? ''}
          onChange={onChange}
          style={{
            width: '100%',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '4px 8px',
            marginTop: '4px',
            fontSize: '0.9rem',
            outline: 'none',
            backgroundColor: 'var(--bg)',
            color: 'var(--text)'
          }}
        />
      ) : (
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '0.95rem',
          fontWeight: '600',
          color: 'var(--text)',
          wordBreak: 'break-word'
        }}>
          {type === 'date' ? formatDisplayDate(value) : (value || 'N/A')}
        </p>
      )}
    </div>
  </div>
);

const SectionWrapper = ({ title, icon: Icon, children, color = "#4F46E5", onDownload }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      backgroundColor: 'var(--surface)',
      borderRadius: '32px',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border)',
      marginBottom: '20px'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ backgroundColor: `${color}15`, padding: '10px', borderRadius: '14px', color }}>
          <Icon size={20} />
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)', margin: 0 }}>{title}</h2>
      </div>
      {onDownload && (
        <button
          onClick={onDownload}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Download Section PDF"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = color; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
        >
          <Download size={18} />
        </button>
      )}
    </div>
    {children}
  </motion.div>
);

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const today = new Date().toISOString().split('T')[0];
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const initialEditData = {
    styleNo: '',
    dispatchDate: '',
    fabricName: '',
    referenceNo: '',
    orderQuantity: '',
    orderPrice: '',
    gsm: '',
    countConst: '',
    width: '',
    design: '',
    notes: '',
    orderDays: '',
    weaver: '',
    bookingReferenceNo: '',
    bookingFabricName: '',
    bookingQuantity: '',
    challan: '',
    price: '',
    bookingCountConst: '',
    bookingWidth: '',
    finishGsm: '',
    bookingComposition: '',
    completionDate: '',
    fabricJobWorkMill: '',
    dyeMillName: '',
    dyeJobCharge: '',
    dyeFinishQuantity: '',
    dyeWidth: '',
    dyeColorDesign: '',
    dyeShortage: '',
    dyeDeliveryDate: '',
    digitalMillName: '',
    digitalJobCharge: '',
    digitalFinishQuantity: '',
    digitalWidth: '',
    digitalDesign: '',
    digitalShortage: '',
    digitalDeliveryDate: '',
    dispatchInvoiceNumber: '',
    dispatchMeter: '',
    dispatchDesignColour: '',
    transportName: '',
    dyeQuantityReceivedEntries: [],
    digitalQuantityReceivedEntries: [],
    dispatchQuantityReceivedEntries: []
  };

  const [editData, setEditData] = useState(initialEditData);
  const [dyeReceiptDate, setDyeReceiptDate] = useState(today);
  const [dyeReceiptQuantity, setDyeReceiptQuantity] = useState('');
  const [dyeReceiptRemark, setDyeReceiptRemark] = useState('');
  const [digitalReceiptDate, setDigitalReceiptDate] = useState(today);
  const [digitalReceiptQuantity, setDigitalReceiptQuantity] = useState('');
  const [digitalReceiptRemark, setDigitalReceiptRemark] = useState('');
  const [dispatchReceiptDate, setDispatchReceiptDate] = useState(today);
  const [dispatchReceiptQuantity, setDispatchReceiptQuantity] = useState('');
  const [dispatchReceiptRemark, setDispatchReceiptRemark] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders/${id}`);
      setOrder(res.data);
      // Reset editData with initial defaults then merge with fetched data to avoid leaks
      setEditData({ ...initialEditData, ...res.data });
      
      // Reset form fields
      setDyeReceiptDate(today);
      setDyeReceiptQuantity('');
      setDyeReceiptRemark('');
      setDigitalReceiptDate(today);
      setDigitalReceiptQuantity('');
      setDigitalReceiptRemark('');
      setDispatchReceiptDate(today);
      setDispatchReceiptQuantity('');
      setDispatchReceiptRemark('');
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleUpdate = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const payload = { ...editData };
      if (currentUser && currentUser.id) {
        payload.lastEditedBy = { id: currentUser.id };
      }
      await api.put(`/api/orders/${id}`, payload);
      alert('Order updated successfully!');
      setIsEditing(false);
      fetchOrderDetails();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order');
    }
  };

  const updateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;
    try {
      await api.patch(`/api/orders/${id}/status?status=${newStatus}`);
      alert(`Order marked as ${newStatus}`);
      fetchOrderDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const generatePDF = (type) => {
    const doc = new jsPDF();
    const typeHeaders = {
      'full': 'FULL ORDER INFORMATION',
      'client': "CLIENT'S ORDER DETAILS",
      'booking': 'FABRIC BOOKING RECORD',
      'jobwork': 'FABRIC JOB WORK DETAILS',
      'history': 'QUANTITY RECEIVED HISTORY',
      'dispatch': 'DISPATCH & DELIVERY RECORD'
    };

    const primaryColor = '#4F46E5';
    const secondaryColor = '#0D9488';
    const accentColor = '#7C3AED';
    const warningColor = '#F59E0B';

    let y = addPdfHeader(doc, typeHeaders[type] || 'ORDER INFORMATION');

    const addSection = (title, data, color) => {
      if (y > 250) { doc.addPage(); y = 25; }
      doc.setDrawColor(color);
      doc.setLineWidth(0.5);
      doc.line(20, y, 190, y);
      
      doc.setTextColor(color);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), 20, y - 2);
      
      y += 10;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      data.forEach(item => {
        if (y > 275) { doc.addPage(); y = 25; }
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.label}:`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.value || 'N/A'}`, 75, y);
        y += 8;
      });
      y += 5;
    };

    const addTable = (title, entries, total, color) => {
      if (y > 240) { doc.addPage(); y = 25; }
      doc.setTextColor(color);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), 20, y);
      y += 8;

      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, 170, 8, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.text('DATE', 25, y + 5);
      doc.text('QUANTITY (MTRS)', 185, y + 5, { align: 'right' });
      y += 8;

      doc.setTextColor(30, 41, 59);
      if (!entries || entries.length === 0) {
        doc.text('No entries recorded.', 25, y + 5);
        y += 8;
      } else {
        entries.forEach(entry => {
          if (y > 275) { doc.addPage(); y = 25; }
          doc.text(formatDisplayDate(entry.entryDate) || 'N/A', 25, y + 5);
          if (entry.remark) {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(` • ${entry.remark}`, 55, y + 5);
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
          }
          doc.text((entry.quantity || 0).toString(), 185, y + 5, { align: 'right' });
          doc.setDrawColor(241, 245, 249);
          doc.line(20, y + 8, 190, y + 8);
          y += 8;
        });
      }

      doc.setFillColor(241, 245, 249);
      doc.rect(20, y, 170, 8, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL RECEIVED', 25, y + 5);
      doc.text(total.toString(), 185, y + 5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 15;
    };

    const currentDyeTotal = (order.dyeQuantityReceivedEntries || []).reduce((sum, e) => sum + Number(e.quantity || 0), 0);
    const currentDigitalTotal = (order.digitalQuantityReceivedEntries || []).reduce((sum, e) => sum + Number(e.quantity || 0), 0);
    const currentDispatchTotal = (order.dispatchQuantityReceivedEntries || []).reduce((sum, e) => sum + Number(e.quantity || 0), 0);

    if (type === 'full' || type === 'client') {
      addSection("Client Order Details", [
        { label: "Customer", value: order.client?.name },
        { label: "Style No", value: order.styleNo },
        { label: "Order Date", value: formatDisplayDate(order.dispatchDate) },
        { label: "Order Days", value: order.orderDays },
        { label: "Fabric Name", value: order.fabricName },
        { label: "Reference No", value: order.referenceNo },
        { label: "Order Quantity", value: order.orderQuantity },
        { label: "Price", value: order.orderPrice },
        { label: "GSM", value: order.gsm },
        { label: "Count/Const", value: order.countConst },
        { label: "Width", value: order.width },
        { label: "Design", value: order.design },
        { label: "Remark", value: order.notes },
        { label: "Current Status", value: order.status }
      ], primaryColor);
    }

    if (type === 'full' || type === 'booking') {
      addSection("Fabric Booking Info", [
        { label: "Weaver", value: order.weaver },
        { label: "Booking Ref No", value: order.bookingReferenceNo },
        { label: "Booking Fabric", value: order.bookingFabricName },
        { label: "Quantity", value: order.bookingQuantity },
        { label: "Challan", value: order.challan },
        { label: "Price", value: order.price },
        { label: "Booking Width", value: order.bookingWidth },
        { label: "Finish GSM", value: order.finishGsm },
        { label: "Composition", value: order.bookingComposition },
        { label: "Expected Completion", value: formatDisplayDate(order.completionDate) }
      ], secondaryColor);
    }

    if (type === 'full' || type === 'jobwork') {
      addSection("Dying & Digital Job Work", [
        { label: "Dye Mill", value: order.dyeMillName },
        { label: "Dye Charge", value: order.dyeJobCharge },
        { label: "Dye Qty", value: order.dyeFinishQuantity },
        { label: "Dye Width", value: order.dyeWidth },
        { label: "Dye Design", value: order.dyeColorDesign },
        { label: "Dye Delivery", value: formatDisplayDate(order.dyeDeliveryDate) },
        { label: "Digital Mill", value: order.digitalMillName },
        { label: "Digital Charge", value: order.digitalJobCharge },
        { label: "Digital Qty", value: order.digitalFinishQuantity },
        { label: "Digital Width", value: order.digitalWidth },
        { label: "Digital Design", value: order.digitalDesign },
        { label: "Digital Delivery", value: formatDisplayDate(order.digitalDeliveryDate) }
      ], accentColor);
    }

    if (type === 'full' || type === 'history') {
      addTable("Dying Receipts History", order.dyeQuantityReceivedEntries, currentDyeTotal, secondaryColor);
      addTable("Digital Receipts History", order.digitalQuantityReceivedEntries, currentDigitalTotal, accentColor);
    }

    if (type === 'full' || type === 'dispatch') {
      addSection("Dispatch & Delivery", [
        { label: "Dispatch Date", value: formatDisplayDate(order.dispatchDate) },
        { label: "Invoice Number", value: order.dispatchInvoiceNumber },
        { label: "Total Meters", value: order.dispatchMeter },
        { label: "Design/Colour", value: order.dispatchDesignColour },
        { label: "Transport", value: order.transportName }
      ], warningColor);
      addTable("Dispatch History", order.dispatchQuantityReceivedEntries, currentDispatchTotal, warningColor);
    }

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()} | Vatsalya Lifestyle Management System | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`${order.styleNo || 'Order'}_${type}_Report.pdf`);
    setToastMsg(`${type.toUpperCase()} Report downloaded successfully!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dispatchDate' || name === 'orderDays') {
        if (updated.dispatchDate && updated.orderDays) {
          const date = new Date(updated.dispatchDate);
          date.setDate(date.getDate() + parseInt(updated.orderDays || 0));
          updated.completionDate = date.toISOString().split('T')[0];
        }
      }
      return updated;
    });
  };

  const addDyeReceiptEntry = () => {
    if (!dyeReceiptDate || !dyeReceiptQuantity) return;
    setEditData(prev => ({
      ...prev,
      dyeQuantityReceivedEntries: [
        ...(prev.dyeQuantityReceivedEntries || []),
        { entryDate: dyeReceiptDate, quantity: Number(dyeReceiptQuantity), remark: dyeReceiptRemark }
      ]
    }));
    setDyeReceiptDate(today);
    setDyeReceiptQuantity('');
    setDyeReceiptRemark('');
  };

  const addDigitalReceiptEntry = () => {
    if (!digitalReceiptDate || !digitalReceiptQuantity) return;
    setEditData(prev => ({
      ...prev,
      digitalQuantityReceivedEntries: [
        ...(prev.digitalQuantityReceivedEntries || []),
        { entryDate: digitalReceiptDate, quantity: Number(digitalReceiptQuantity), remark: digitalReceiptRemark }
      ]
    }));
    setDigitalReceiptDate(today);
    setDigitalReceiptQuantity('');
    setDigitalReceiptRemark('');
  };

  const removeDyeReceiptEntry = (index) => {
    setEditData(prev => ({
      ...prev,
      dyeQuantityReceivedEntries: (prev.dyeQuantityReceivedEntries || []).filter((_, idx) => idx !== index)
    }));
  };

  const removeDigitalReceiptEntry = (index) => {
    setEditData(prev => ({
      ...prev,
      digitalQuantityReceivedEntries: (prev.digitalQuantityReceivedEntries || []).filter((_, idx) => idx !== index)
    }));
  };

  const addDispatchReceiptEntry = () => {
    if (!dispatchReceiptDate || !dispatchReceiptQuantity) return;
    setEditData(prev => ({
      ...prev,
      dispatchQuantityReceivedEntries: [
        ...(prev.dispatchQuantityReceivedEntries || []),
        { entryDate: dispatchReceiptDate, quantity: Number(dispatchReceiptQuantity), remark: dispatchReceiptRemark }
      ]
    }));
    setDispatchReceiptDate(today);
    setDispatchReceiptQuantity('');
    setDispatchReceiptRemark('');
  };

  const removeDispatchReceiptEntry = (index) => {
    setEditData(prev => ({
      ...prev,
      dispatchQuantityReceivedEntries: (prev.dispatchQuantityReceivedEntries || []).filter((_, idx) => idx !== index)
    }));
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FB' }}>
      <p style={{ color: '#64748B', fontWeight: '500' }}>Loading order details...</p>
    </div>
  );

  if (!order) return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
      <p>Order not found.</p>
      <button onClick={() => navigate('/deals')} className="btn btn-primary" style={{ marginTop: '20px' }}>Go Back</button>
    </div>
  );

  const currentDyeEntries = isEditing ? editData.dyeQuantityReceivedEntries || [] : order.dyeQuantityReceivedEntries || [];
  const currentDigitalEntries = isEditing ? editData.digitalQuantityReceivedEntries || [] : order.digitalQuantityReceivedEntries || [];
  const currentDispatchEntries = isEditing ? editData.dispatchQuantityReceivedEntries || [] : order.dispatchQuantityReceivedEntries || [];

  const currentDyeTotal = currentDyeEntries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  const currentDigitalTotal = currentDigitalEntries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  const currentDispatchTotal = currentDispatchEntries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);

  const getStatusStyle = (order) => {
    if (!order) return { bg: 'var(--surface)', color: 'var(--muted)', icon: null, label: 'N/A' };
    const status = order.status;
    const s = (status || 'PENDING').toUpperCase();

    if (s === 'COMPLETED') return { bg: 'var(--status-success-bg)', color: 'var(--status-success-text)', icon: <CheckCircle size={16} />, label: 'COMPLETED' };
    if (['CANCELED', 'CANCELLED'].includes(s)) return { bg: 'var(--status-danger-bg)', color: 'var(--status-danger-text)', icon: <XCircle size={16} />, label: 'CANCELLED' };
    if (s === 'DELAYED') return { bg: 'var(--status-danger-bg)', color: 'var(--status-danger-text)', icon: <Clock size={16} />, label: 'DELAYED' };

    // Dynamic delay check
    if (order.completionDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completion = new Date(order.completionDate);
      if (completion < today && ['PENDING', 'PROCESSING', 'ONGOING'].includes(s)) {
        return { bg: 'var(--status-danger-bg)', color: 'var(--status-danger-text)', icon: <Clock size={16} />, label: 'DELAYED' };
      }
    }

    if (['PENDING', 'PROCESSING', 'ONGOING'].includes(s)) return { bg: 'var(--status-warning-bg)', color: 'var(--status-warning-text)', icon: <Clock size={16} />, label: s };
    return { bg: 'var(--surface)', color: 'var(--muted)', icon: null, label: s };
  };

  const statusInfo = getStatusStyle(order);
  const isOngoing = ['PENDING', 'PROCESSING', 'ONGOING', 'DELAYED'].includes((order.status || 'PENDING').toUpperCase()) || statusInfo.label === 'DELAYED';

  return (
    <div className="page-shell" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: '100px' }}>
      <div className="page-header" style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-sm)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4">
          <ArrowLeft onClick={() => navigate('/deals')} style={{ cursor: 'pointer' }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Order Details</h1>
        </div>
        <div className="flex gap-2">
          <div
            onClick={() => generatePDF('full')}
            style={{
              backgroundColor: '#F1F5F9',
              color: 'var(--primary)',
              padding: '10px',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Download Full Report"
          >
            <Download size={18} />
          </div>
          {isOngoing && (
            <div
              onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
              style={{
                backgroundColor: isEditing ? '#10B981' : 'var(--primary)',
                color: 'white',
                padding: '10px',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
            </div>
          )}
        </div>
      </div>

      <div className="page-container" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            backgroundColor: statusInfo.bg,
            color: statusInfo.color,
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>
        </div>

        <SectionWrapper title="Client's Order" icon={User} color="#4F46E5" onDownload={() => generatePDF('client')}>
          <DetailItem
            label="Customer Name"
            value={order.client?.name}
            icon={User}
            editable={false}
            isEditing={isEditing}
            editData={editData}
            onChange={handleChange}
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Style No" value={order.styleNo} icon={Hash} name="styleNo" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Order Date" value={order.dispatchDate} icon={Calendar} name="dispatchDate" isEditing={isEditing} editData={editData} onChange={handleChange} type="date" />
            <DetailItem label="Order Days" value={order.orderDays} icon={Clock} name="orderDays" isEditing={isEditing} editData={editData} onChange={handleChange} type="number" />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Fabric Name" value={order.fabricName} icon={Package} name="fabricName" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Reference No" value={order.referenceNo} icon={Hash} name="referenceNo" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Order Quantity" value={order.orderQuantity} icon={Layers} name="orderQuantity" isEditing={isEditing} editData={editData} onChange={handleChange} type="number" />
            <DetailItem label="Price" value={order.orderPrice} icon={DollarSign} name="orderPrice" isEditing={isEditing} editData={editData} onChange={handleChange} type="number" />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="GSM" value={order.gsm} icon={Hash} name="gsm" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Count/Const" value={order.countConst} icon={Hash} name="countConst" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Width" value={order.width} icon={Info} name="width" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Design" value={order.design} icon={Palette} name="design" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <div>
            <p style={{ margin: '16px 0 8px 0', fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Client Remark</p>
            {isEditing ? (
              <textarea
                name="notes"
                value={editData.notes || ''}
                onChange={handleChange}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', fontSize: '0.9rem', outline: 'none', minHeight: '80px', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
              />
            ) : (
              <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.5' }}>{order.notes || 'No remarks provided'}</p>
              </div>
            )}
          </div>
        </SectionWrapper>
        
        {/* Audit Info Section */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--bg)', padding: '8px', borderRadius: '10px', color: 'var(--muted)' }}>
              <User size={16} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Added By</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)' }}>
                {order.user?.name || 'System'}
              </p>
            </div>
          </div>

          {order.lastEditedBy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--bg)', padding: '8px', borderRadius: '10px', color: 'var(--muted)' }}>
                <Edit3 size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Edited By</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)' }}>
                  {order.lastEditedBy?.name}
                </p>
              </div>
            </div>
          )}
        </div>

        <SectionWrapper title="Fabric Booking" icon={Layers} color="#0D9488" onDownload={() => generatePDF('booking')}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Weaver" value={order.weaver} icon={User} name="weaver" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Reference No" value={order.bookingReferenceNo} icon={Hash} name="bookingReferenceNo" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Fabric Name" value={order.bookingFabricName} icon={Package} name="bookingFabricName" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Quantity" value={order.bookingQuantity} icon={Layers} name="bookingQuantity" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Challan" value={order.challan} icon={FileCheck} name="challan" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Price" value={order.price} icon={DollarSign} name="price" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Count / Const" value={order.bookingCountConst} icon={Hash} name="bookingCountConst" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Width" value={order.bookingWidth} icon={Ruler} name="bookingWidth" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DetailItem label="Finish GSM" value={order.finishGsm} icon={Layers} name="finishGsm" isEditing={isEditing} editData={editData} onChange={handleChange} />
            <DetailItem label="Composition" value={order.bookingComposition} icon={Info} name="bookingComposition" isEditing={isEditing} editData={editData} onChange={handleChange} />
          </div>
          <DetailItem label="Completion Date" value={order.completionDate} icon={Calendar} name="completionDate" isEditing={isEditing} editData={editData} onChange={handleChange} type="date" />
        </SectionWrapper>

        <SectionWrapper title="Fabric Job Work" icon={Briefcase} color="#7C3AED" onDownload={() => generatePDF('jobwork')}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {isEditing ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Mill</p>
                <select
                  name="fabricJobWorkMill"
                  value={editData.fabricJobWorkMill || ''}
                  onChange={handleChange}
                  style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px', marginTop: '4px', fontSize: '0.95rem', backgroundColor: '#F8FAFC' }}
                >
                  <option value="">Select mill option</option>
                  <option value="dyingAndPrinting">Dying & Printing Mill</option>
                  <option value="digitalPrinting">Digital Printing & Value Addition</option>
                  <option value="both">Both</option>
                </select>
              </div>
            ) : (
              <DetailItem
                label="Selected Mill"
                value={order.fabricJobWorkMill ? (order.fabricJobWorkMill === 'dyingAndPrinting' ? 'Dying & Printing Mill' : order.fabricJobWorkMill === 'digitalPrinting' ? 'Digital Printing & Value Addition' : order.fabricJobWorkMill) : 'N/A'}
                icon={Layers}
                editable={false}
                isEditing={false}
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginTop: '16px' }}>
            {(isEditing ? editData.fabricJobWorkMill === 'dyingAndPrinting' || editData.fabricJobWorkMill === 'both' : order.fabricJobWorkMill === 'dyingAndPrinting' || order.fabricJobWorkMill === 'both') && (
              <>
                <DetailItem label="Dye Mill Name" value={order.dyeMillName} icon={User} name="dyeMillName" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Dye Job Charge" value={order.dyeJobCharge} icon={DollarSign} name="dyeJobCharge" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Dye Finish Quantity" value={order.dyeFinishQuantity} icon={Package} name="dyeFinishQuantity" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Dye Width" value={order.dyeWidth} icon={Ruler} name="dyeWidth" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Dye Colour / Design" value={order.dyeColorDesign} icon={Palette} name="dyeColorDesign" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Dye Shortage" value={order.dyeShortage} icon={Info} name="dyeShortage" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Dye Delivery Date" value={order.dyeDeliveryDate} icon={Calendar} name="dyeDeliveryDate" type="date" isEditing={isEditing} editData={editData} onChange={handleChange} />
              </>
            )}

            {(isEditing ? editData.fabricJobWorkMill === 'digitalPrinting' || editData.fabricJobWorkMill === 'both' : order.fabricJobWorkMill === 'digitalPrinting' || order.fabricJobWorkMill === 'both') && (
              <>
                <DetailItem label="Digital Mill Name" value={order.digitalMillName} icon={User} name="digitalMillName" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Digital Job Charge" value={order.digitalJobCharge} icon={DollarSign} name="digitalJobCharge" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Digital Finish Quantity" value={order.digitalFinishQuantity} icon={Package} name="digitalFinishQuantity" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Digital Width" value={order.digitalWidth} icon={Ruler} name="digitalWidth" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Digital Design" value={order.digitalDesign} icon={Palette} name="digitalDesign" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Digital Shortage" value={order.digitalShortage} icon={Info} name="digitalShortage" isEditing={isEditing} editData={editData} onChange={handleChange} />
                <DetailItem label="Digital Delivery Date" value={order.digitalDeliveryDate} icon={Calendar} name="digitalDeliveryDate" type="date" isEditing={isEditing} editData={editData} onChange={handleChange} />
              </>
            )}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Quantity Received History" icon={FileCheck} color="#4F46E5" onDownload={() => generatePDF('history')}>
          <div style={{ display: 'grid', gap: '20px' }}>
            {(isEditing ? editData.fabricJobWorkMill === 'dyingAndPrinting' || editData.fabricJobWorkMill === 'both' : order.fabricJobWorkMill === 'dyingAndPrinting' || order.fabricJobWorkMill === 'both') && (
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 12px 0', fontWeight: '800', fontSize: '1.05rem', color: '#0F172A' }}>Dying & Printing Receipts</p>
                  {isEditing && (
                    <div style={{ 
                      display: 'grid', 
                      gap: '12px', 
                      padding: '16px', 
                      backgroundColor: 'white', 
                      borderRadius: '16px', 
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Date</p>
                          <input
                            type="date"
                            value={dyeReceiptDate}
                            onChange={(e) => setDyeReceiptDate(e.target.value)}
                            style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Quantity</p>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Meters"
                            value={dyeReceiptQuantity}
                            onChange={(e) => setDyeReceiptQuantity(e.target.value)}
                            style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Remark / Note</p>
                        <input
                          type="text"
                          placeholder="Optional remark..."
                          value={dyeReceiptRemark}
                          onChange={(e) => setDyeReceiptRemark(e.target.value)}
                          style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addDyeReceiptEntry}
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          borderRadius: '12px', 
                          fontSize: '0.9rem', 
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                        }}
                      >
                        Add Receipt Entry
                      </button>
                    </div>
                  )}
                </div>                 {currentDyeEntries.length > 0 ? (
                  <>
                    {currentDyeEntries.map((entry, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: index < currentDyeEntries.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: 'var(--text)' }}>{formatDisplayDate(entry.entryDate)}</span>
                          {entry.remark && <span style={{ color: 'var(--muted)', fontSize: '0.85rem', marginLeft: '12px' }}>• {entry.remark}</span>}
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--text)' }}>{entry.quantity}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeDyeReceiptEntry(index)}
                            style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.9rem' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0 0', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                      <span style={{ color: 'var(--text)', fontWeight: '700' }}>Total Received</span>
                      <span style={{ fontWeight: '700', color: 'var(--text)' }}>{currentDyeTotal}</span>
                    </div>
                  </>
                )}
              </div>
            )}
            {(isEditing ? editData.fabricJobWorkMill === 'digitalPrinting' || editData.fabricJobWorkMill === 'both' : order.fabricJobWorkMill === 'digitalPrinting' || order.fabricJobWorkMill === 'both') && (
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 12px 0', fontWeight: '800', fontSize: '1.05rem', color: '#0F172A' }}>Digital Printing Receipts</p>
                  {isEditing && (
                    <div style={{ 
                      display: 'grid', 
                      gap: '12px', 
                      padding: '16px', 
                      backgroundColor: 'white', 
                      borderRadius: '16px', 
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Date</p>
                          <input
                            type="date"
                            value={digitalReceiptDate}
                            onChange={(e) => setDigitalReceiptDate(e.target.value)}
                            style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Quantity</p>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Meters"
                            value={digitalReceiptQuantity}
                            onChange={(e) => setDigitalReceiptQuantity(e.target.value)}
                            style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Remark / Note</p>
                        <input
                          type="text"
                          placeholder="Optional remark..."
                          value={digitalReceiptRemark}
                          onChange={(e) => setDigitalReceiptRemark(e.target.value)}
                          style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addDigitalReceiptEntry}
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          borderRadius: '12px', 
                          fontSize: '0.9rem', 
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                        }}
                      >
                        Add Receipt Entry
                      </button>
                    </div>
                  )}
                </div>
                {currentDigitalEntries.length > 0 ? (
                  <>
                    {currentDigitalEntries.map((entry, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: index < currentDigitalEntries.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: 'var(--text)' }}>{formatDisplayDate(entry.entryDate)}</span>
                          {entry.remark && <span style={{ color: 'var(--muted)', fontSize: '0.85rem', marginLeft: '12px' }}>• {entry.remark}</span>}
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--text)' }}>{entry.quantity}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeDigitalReceiptEntry(index)}
                            style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.9rem' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0 0', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                      <span style={{ color: 'var(--text)', fontWeight: '700' }}>Total Received</span>
                      <span style={{ fontWeight: '700', color: 'var(--text)' }}>{currentDigitalTotal}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ margin: 0, color: 'var(--muted)' }}>No digital printing receipt entries yet.</p>
                )}
              </div>
            )}
          </div>
        </SectionWrapper>

        <div style={{
          marginTop: '20px',
          padding: '24px',
          borderRadius: '32px',
          backgroundColor: '#1F2937',
          border: '1px solid #334155',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '14px', color: '#FBBF24' }}>
                <Truck size={22} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FBBF24', margin: 0 }}>Dispatch & Delivery</h2>
            </div>
            <button
              onClick={() => generatePDF('dispatch')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #334155',
                color: '#FBBF24',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Download Dispatch PDF"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
            >
              <Download size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Custom DetailItem-like components for dark theme */}
            {[
              { label: "Date", value: order.dispatchDate, icon: Calendar, name: "dispatchDate", type: "date" },
              { label: "Inv Number", value: order.dispatchInvoiceNumber, icon: Hash, name: "dispatchInvoiceNumber" },
              { label: "Meter", value: order.dispatchMeter, icon: Ruler, name: "dispatchMeter" },
              { label: "Design / Colour", value: order.dispatchDesignColour, icon: Palette, name: "dispatchDesignColour" },
              { label: "Transport", value: order.transportName, icon: Truck, name: "transportName" }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', minWidth: 0 }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '12px', height: 'fit-content', flexShrink: 0 }}>
                  <item.icon size={18} color="#FBBF24" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                  {isEditing ? (
                    <input
                      type={item.type || "text"}
                      name={item.name}
                      value={editData[item.name] ?? ''}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        marginTop: '4px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: '#111827',
                        color: 'white'
                      }}
                    />
                  ) : (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>
                      {item.type === 'date' ? formatDisplayDate(item.value) : (item.value || 'N/A')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dispatch Quantity History */}
          <div style={{ backgroundColor: '#111827', borderRadius: '20px', padding: '18px', border: '1px solid #334155' }}>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontWeight: '700', color: '#F8FAFC', fontSize: '1.05rem' }}>Dispatch Receipt History</p>
              {isEditing && (
                <div style={{ 
                  display: 'grid', 
                  gap: '12px', 
                  padding: '18px', 
                  backgroundColor: '#1F2937', 
                  borderRadius: '16px', 
                  border: '1px solid #374151',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Dispatch Date</p>
                      <input
                        type="date"
                        value={dispatchReceiptDate}
                        onChange={(e) => setDispatchReceiptDate(e.target.value)}
                        style={{ width: '100%', border: '1px solid #374151', borderRadius: '10px', padding: '10px', backgroundColor: '#111827', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Quantity</p>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Meters"
                        value={dispatchReceiptQuantity}
                        onChange={(e) => setDispatchReceiptQuantity(e.target.value)}
                        style={{ width: '100%', border: '1px solid #374151', borderRadius: '10px', padding: '10px', backgroundColor: '#111827', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Remark</p>
                    <input
                      type="text"
                      placeholder="Add a remark..."
                      value={dispatchReceiptRemark}
                      onChange={(e) => setDispatchReceiptRemark(e.target.value)}
                      style={{ width: '100%', border: '1px solid #374151', borderRadius: '10px', padding: '10px', backgroundColor: '#111827', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addDispatchReceiptEntry}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      fontSize: '0.9rem', 
                      fontWeight: '800', 
                      background: '#FBBF24', 
                      color: '#111827', 
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.1s active'
                    }}
                  >
                    Add Dispatch Record
                  </button>
                </div>
              )}
            </div>

            {currentDispatchEntries.length > 0 ? (
              <>
                {currentDispatchEntries.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: index < currentDispatchEntries.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{formatDisplayDate(entry.entryDate)}</span>
                      {entry.remark && <span style={{ color: 'var(--muted)', fontSize: '0.85rem', marginLeft: '12px' }}>• {entry.remark}</span>}
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--text)' }}>{entry.quantity}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeDispatchReceiptEntry(index)}
                        style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0 0', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                  <span style={{ color: 'var(--muted)', fontWeight: '700' }}>Total Dispatched</span>
                  <span style={{ fontWeight: '800', color: '#FBBF24', fontSize: '1.1rem' }}>{currentDispatchTotal}</span>
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>No dispatch receipt entries yet.</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isOngoing && !isEditing && (
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => updateStatus('CANCELLED')}
              style={{
                flex: 1,
                backgroundColor: 'var(--surface)',
                color: '#EF4444',
                border: '1px solid var(--border)',
                padding: '16px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Cancel Order
            </button>
            <button
              onClick={() => updateStatus('COMPLETED')}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '1rem',
                border: 'none',
                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)'
              }}
            >
              Complete Order
            </button>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => { setIsEditing(false); setEditData(order); }}
              style={{
                flex: 1,
                backgroundColor: 'var(--surface)',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                padding: '16px',
                borderRadius: '20px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <X size={20} /> Cancel Edit
            </button>
            <button
              onClick={handleUpdate}
              style={{
                flex: 2,
                backgroundColor: '#10B981',
                color: 'white',
                padding: '16px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '1.1rem',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
              }}
            >
              <Save size={22} /> Save Changes
            </button>
          </div>
        )}
        
        {/* Admin Delete Action */}
        {!isEditing && JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' && (
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this order? This action cannot be undone and it will be completely removed from the database.")) {
                  try {
                    await api.delete(`/api/orders/${id}`);
                    alert("Order deleted successfully.");
                    navigate('/admin-dashboard');
                  } catch (err) {
                    console.error('Error deleting order:', err);
                    alert("Failed to delete order.");
                  }
                }
              }}
              style={{
                width: '100%',
                backgroundColor: 'var(--status-danger-bg)',
                color: 'var(--status-danger-text)',
                border: '1px solid var(--border)',
                padding: '16px',
                borderRadius: '20px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Trash2 size={20} /> Delete Order (Admin Only)
            </button>
          </div>
        )}
      </div>
      <Toast 
        show={showToast} 
        message={toastMsg} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default OrderDetails;
