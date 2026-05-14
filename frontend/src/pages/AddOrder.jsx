import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, User, FileCheck, Briefcase, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const SectionHeader = ({ icon: Icon, title, color, bgColor }) => (
  <div className="flex items-center gap-3 mb-6">
    <div style={{ backgroundColor: bgColor, padding: '12px', borderRadius: '16px', color: color }}>
      <Icon size={24} />
    </div>
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>{title}</h2>
      <div style={{ height: '3px', width: '30px', backgroundColor: color, borderRadius: '2px', marginTop: '4px' }}></div>
    </div>
  </div>
);

const AddOrder = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    customerId: '',
    width: '',
    fabricName: '',
    orderDate: today,
    referenceNo: '',
    orderQuantity: '',
    orderPrice: '',
    styleNo: '',
    gsm: '',
    countConst: '',
    design: '',
    remark: '',
    days: '',
    expectedCompletionDate: '',
    // Fabric Booking fields
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
    // Fabric Job Work fields
    fabricJobWorkMill: '',
    dyeMillName: '',
    dyeJobCharge: '',
    dyeFinishQuantity: '',
    dyeWidth: '',
    dyeColorDesign: '',
    dyeShortage: '',
    dyeDeliveryDate: '',
    dyeQuantityReceipts: [],
    dyeReceiptDate: today,
    dyeReceiptQuantity: '',
    digitalMillName: '',
    digitalJobCharge: '',
    digitalFinishQuantity: '',
    digitalWidth: '',
    digitalDesign: '',
    digitalShortage: '',
    digitalDeliveryDate: '',
    dispatchDate: today,
    dispatchInvoiceNumber: '',
    dispatchMeter: '',
    dispatchDesignColour: '',
    transport: '',
    dispatchQuantityReceipts: [],
    dispatchReceiptDate: today,
    dispatchReceiptQuantity: '',
    digitalQuantityReceipts: [],
    digitalReceiptDate: today,
    digitalReceiptQuantity: '',
    dyeReceiptRemark: '',
    digitalReceiptRemark: '',
    dispatchReceiptRemark: ''
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/clients`);
        setClients(res.data || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };

      // Auto-calculate completion date if orderDate or days change
      if (name === 'orderDate' || name === 'days') {
        if (updated.orderDate && updated.days) {
          const date = new Date(updated.orderDate);
          date.setDate(date.getDate() + parseInt(updated.days || 0));
          updated.expectedCompletionDate = date.toISOString().split('T')[0];
        }
      }
      return updated;
    });
  };

  const addDyeQuantityReceipt = () => {
    if (!formData.dyeReceiptQuantity || !formData.dyeReceiptDate) return;
    setFormData(prev => ({
      ...prev,
      dyeQuantityReceipts: [...prev.dyeQuantityReceipts, { 
        entryDate: formData.dyeReceiptDate, 
        quantity: formData.dyeReceiptQuantity,
        remark: formData.dyeReceiptRemark
      }],
      dyeReceiptQuantity: '',
      dyeReceiptRemark: ''
    }));
  };

  const addDigitalQuantityReceipt = () => {
    if (!formData.digitalReceiptQuantity || !formData.digitalReceiptDate) return;
    setFormData(prev => ({
      ...prev,
      digitalQuantityReceipts: [...prev.digitalQuantityReceipts, { 
        entryDate: formData.digitalReceiptDate, 
        quantity: formData.digitalReceiptQuantity,
        remark: formData.digitalReceiptRemark
      }],
      digitalReceiptQuantity: '',
      digitalReceiptRemark: ''
    }));
  };

  const addDispatchQuantityReceipt = () => {
    const { dispatchReceiptDate, dispatchReceiptQuantity, dispatchReceiptRemark } = formData;
    if (!dispatchReceiptDate || !dispatchReceiptQuantity) return;
    setFormData(prev => ({
      ...prev,
      dispatchQuantityReceipts: [
        ...prev.dispatchQuantityReceipts,
        { entryDate: dispatchReceiptDate, quantity: dispatchReceiptQuantity, remark: dispatchReceiptRemark }
      ],
      dispatchReceiptDate: today,
      dispatchReceiptQuantity: '',
      dispatchReceiptRemark: ''
    }));
  };

  const removeDyeReceipt = (index) => {
    setFormData(prev => ({
      ...prev,
      dyeQuantityReceipts: prev.dyeQuantityReceipts.filter((_, idx) => idx !== index)
    }));
  };

  const removeDigitalReceipt = (index) => {
    setFormData(prev => ({
      ...prev,
      digitalQuantityReceipts: prev.digitalQuantityReceipts.filter((_, idx) => idx !== index)
    }));
  };

  const removeDispatchReceipt = (index) => {
    setFormData(prev => ({
      ...prev,
      dispatchQuantityReceipts: prev.dispatchQuantityReceipts.filter((_, idx) => idx !== index)
    }));
  };

  const totalDyeReceived = formData.dyeQuantityReceipts.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalDigitalReceived = formData.digitalQuantityReceipts.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalDispatchReceived = formData.dispatchQuantityReceipts.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert('Please select a client before submitting.');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const payload = {
      client: { id: formData.customerId },
      user: { id: currentUser.id },
      styleNo: formData.styleNo,
      fabricName: formData.fabricName,
      referenceNo: formData.referenceNo,
      orderQuantity: formData.orderQuantity,
      orderPrice: formData.orderPrice,
      width: formData.width,
      gsm: formData.gsm,
      countConst: formData.countConst,
      design: formData.design,
      quality: formData.quality || '',
      weaver: formData.weaver,
      bookingReferenceNo: formData.bookingReferenceNo,
      bookingFabricName: formData.bookingFabricName,
      bookingQuantity: formData.bookingQuantity,
      challan: formData.challan,
      price: formData.price,
      bookingCountConst: formData.bookingCountConst,
      bookingWidth: formData.bookingWidth,
      finishGsm: formData.finishGsm,
      bookingComposition: formData.bookingComposition,
      completionDate: formData.expectedCompletionDate || formData.completionDate,
      fabricJobWorkMill: formData.fabricJobWorkMill,
      dyeMillName: formData.dyeMillName,
      dyeJobCharge: formData.dyeJobCharge,
      dyeFinishQuantity: formData.dyeFinishQuantity,
      dyeWidth: formData.dyeWidth,
      dyeColorDesign: formData.dyeColorDesign,
      dyeShortage: formData.dyeShortage,
      dyeDeliveryDate: formData.dyeDeliveryDate,
      dyeQuantityReceivedEntries: formData.dyeQuantityReceipts.map(item => ({ entryDate: item.entryDate, quantity: Number(item.quantity), remark: item.remark })),
      digitalMillName: formData.digitalMillName,
      digitalJobCharge: formData.digitalJobCharge,
      digitalFinishQuantity: formData.digitalFinishQuantity,
      digitalWidth: formData.digitalWidth,
      digitalDesign: formData.digitalDesign,
      digitalShortage: formData.digitalShortage,
      digitalDeliveryDate: formData.digitalDeliveryDate,
      dispatchDate: formData.dispatchDate || formData.orderDate,
      dispatchInvoiceNumber: formData.dispatchInvoiceNumber,
      dispatchMeter: formData.dispatchMeter,
      dispatchDesignColour: formData.dispatchDesignColour,
      transportName: formData.transport,
      dispatchQuantityReceivedEntries: formData.dispatchQuantityReceipts.map(item => ({ entryDate: item.entryDate, quantity: Number(item.quantity), remark: item.remark })),
      digitalQuantityReceivedEntries: formData.digitalQuantityReceipts.map(item => ({ entryDate: item.entryDate, quantity: Number(item.quantity), remark: item.remark })),
      quantity: formData.quantity,
      rate: formData.rate,
      totalAmount: formData.totalAmount,
      extraExpense: formData.extraExpense,
      discount: formData.discount,
      grandTotal: formData.grandTotal,
      advancePaid: formData.advancePaid,
      dueDate: formData.dueDate,
      paymentMethod: formData.paymentMethod,
      creditDays: formData.creditDays,
      notes: formData.remark,
      priority: formData.priority,
      status: formData.status || 'PENDING'
    };

    try {
      setLoading(true);
      await api.post(`/api/orders`, payload);
      alert('Order created successfully!');
      navigate('/deals');
    } catch (err) {
      console.error('Error saving order:', err);
      alert('Failed to create order.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="page-shell">
      <div className="page-header" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button type="button" className="icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: '1.25rem' }}>Add Order</h1>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div className="page-container" style={{ padding: '20px', paddingBottom: '100px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Section 1: Client's Order - Blue Theme */}
          <div className="card" style={{
            padding: '28px',
            borderRadius: '32px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(79, 70, 229, 0.08)',
            backgroundColor: 'white',
            borderLeft: '8px solid #4F46E5'
          }}>
            <SectionHeader icon={User} title="Client's Order" color="#4F46E5" bgColor="#EEF2FF" />

            <div className="form-group">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label" style={{ fontWeight: '600', color: '#475569' }}>Select Client</label>
                <button
                  type="button"
                  onClick={() => navigate('/add-client')}
                  className="button button-secondary"
                  style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '10px' }}
                >
                  <Plus size={14} /> New Client
                </button>
              </div>
              <select
                className="form-input"
                required
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }}
              >
                <option value="">{loading ? 'Loading clients...' : 'Choose a client'}</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Style No</label>
              <input type="text" className="form-input" name="styleNo" placeholder="ART-5001" value={formData.styleNo} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Order Date</label>
                <DatePicker
                  selected={formData.orderDate ? new Date(formData.orderDate) : null}
                  onChange={(date) => handleChange({ target: { name: 'orderDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                  dateFormat="dd/MM/yyyy"
                  className="form-input"
                  placeholderText="dd/mm/yyyy"
                  style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }}
                />
              </div>
              <div className="form-group" style={{ flex: 0.4, marginBottom: 0 }}>
                <label className="form-label">Days</label>
                <input type="number" className="form-input" name="days" placeholder="0" value={formData.days} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Complete Date</label>
                <DatePicker
                  selected={formData.expectedCompletionDate ? new Date(formData.expectedCompletionDate) : null}
                  onChange={(date) => handleChange({ target: { name: 'expectedCompletionDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                  dateFormat="dd/MM/yyyy"
                  className="form-input"
                  placeholderText="dd/mm/yyyy"
                  style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }}
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Fabric Name</label>
                <input type="text" className="form-input" name="fabricName" placeholder="e.g. Cotton Satin" value={formData.fabricName} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Reference No</label>
                <input type="text" className="form-input" name="referenceNo" placeholder="Enter reference no" value={formData.referenceNo} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Order Quantity</label>
                <input type="number" className="form-input" name="orderQuantity" placeholder="Enter quantity" value={formData.orderQuantity} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Price</label>
                <input type="number" className="form-input" name="orderPrice" placeholder="Enter price" value={formData.orderPrice} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">GSM</label>
                <input type="text" className="form-input" name="gsm" placeholder="180" value={formData.gsm} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Count / Const</label>
                <input type="text" className="form-input" name="countConst" placeholder="40x40" value={formData.countConst} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Width</label>
                <input type="text" className="form-input" name="width" placeholder="e.g. 45 inches" value={formData.width} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Design</label>
                <input type="text" className="form-input" name="design" placeholder="e.g. Floral Print" value={formData.design} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Client Remark</label>
              <textarea className="form-input" name="remark" placeholder="Any additional instructions..." style={{ height: '80px', resize: 'none', backgroundColor: '#F8FAFC', borderRadius: '16px' }} value={formData.remark} onChange={handleChange}></textarea>
            </div>
          </div>

          {/* Section 2: Fabric Booking - Teal Theme */}
          <div className="card" style={{
            padding: '28px',
            borderRadius: '32px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(13, 148, 136, 0.08)',
            backgroundColor: 'white',
            borderLeft: '8px solid #0D9488'
          }}>
            <SectionHeader icon={Briefcase} title="Fabric Booking" color="#0D9488" bgColor="#F0FDFA" />

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Weaver</label>
                <input type="text" className="form-input" name="weaver" placeholder="Enter weaver name" value={formData.weaver} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Reference No</label>
                <input type="text" className="form-input" name="bookingReferenceNo" placeholder="Enter ref no" value={formData.bookingReferenceNo} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Fabric Name</label>
                <input type="text" className="form-input" name="bookingFabricName" placeholder="Enter fabric name" value={formData.bookingFabricName} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Quantity</label>
                <input type="text" className="form-input" name="bookingQuantity" placeholder="Enter quantity" value={formData.bookingQuantity} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Challan</label>
                <input type="text" className="form-input" name="challan" placeholder="Enter challan" value={formData.challan} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Price</label>
                <input type="text" className="form-input" name="price" placeholder="Enter price" value={formData.price} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Count / Const</label>
                <input type="text" className="form-input" name="bookingCountConst" placeholder="Enter count/const" value={formData.bookingCountConst} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Width</label>
                <input type="text" className="form-input" name="bookingWidth" placeholder="Enter width" value={formData.bookingWidth} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Finish GSM</label>
                <input type="text" className="form-input" name="finishGsm" placeholder="Enter finish gsm" value={formData.finishGsm} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Composition</label>
                <input type="text" className="form-input" name="bookingComposition" placeholder="Enter composition" value={formData.bookingComposition} onChange={handleChange} style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Completion Date</label>
              <DatePicker
                selected={formData.completionDate ? new Date(formData.completionDate) : null}
                onChange={(date) => handleChange({ target: { name: 'completionDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                dateFormat="dd/MM/yyyy"
                className="form-input"
                placeholderText="dd/mm/yyyy"
                style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }}
              />
            </div>
          </div>

          <div className="card" style={{
            padding: '28px',
            borderRadius: '32px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(79, 70, 229, 0.08)',
            backgroundColor: 'white',
            borderLeft: '8px solid #4F46E5'
          }}>
            <SectionHeader icon={Layers} title="Fabric Job Work" color="#4F46E5" bgColor="#EEF2FF" />

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Mill</label>
              <select
                className="form-input"
                name="fabricJobWorkMill"
                value={formData.fabricJobWorkMill}
                onChange={handleChange}
                style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }}
              >
                <option value="">Select mill option</option>
                <option value="dyingAndPrinting">Dying & Printing Mill</option>
                <option value="digitalPrinting">Digital Printing & Value Addition</option>
                <option value="both">Both</option>
              </select>
            </div>

            {(formData.fabricJobWorkMill === 'dyingAndPrinting' || formData.fabricJobWorkMill === 'both') && (
              <div className="card" style={{
                padding: '20px',
                borderRadius: '24px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                marginBottom: '18px'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0F172A' }}>Dying & Printing Mill Details</h3>
                <p style={{ margin: '8px 0 16px', color: '#475569', fontSize: '0.9rem' }}>Fill in the dying and printing-specific fields below.</p>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Mill Name</label>
                    <input type="text" className="form-input" name="dyeMillName" value={formData.dyeMillName} onChange={handleChange} placeholder="Enter mill name" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Job Charge</label>
                    <input type="text" className="form-input" name="dyeJobCharge" value={formData.dyeJobCharge} onChange={handleChange} placeholder="Enter job charge" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Finish Quantity</label>
                    <input type="text" className="form-input" name="dyeFinishQuantity" value={formData.dyeFinishQuantity} onChange={handleChange} placeholder="Enter finish quantity" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Width</label>
                    <input type="text" className="form-input" name="dyeWidth" value={formData.dyeWidth} onChange={handleChange} placeholder="Enter width" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Colour / Design</label>
                    <input type="text" className="form-input" name="dyeColorDesign" value={formData.dyeColorDesign} onChange={handleChange} placeholder="Enter colour or design" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Shortage</label>
                    <input type="text" className="form-input" name="dyeShortage" value={formData.dyeShortage} onChange={handleChange} placeholder="Enter shortage" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Delivery Date</label>
                  <DatePicker
                    selected={formData.dyeDeliveryDate ? new Date(formData.dyeDeliveryDate) : null}
                    onChange={(date) => handleChange({ target: { name: 'dyeDeliveryDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                    dateFormat="dd/MM/yyyy"
                    className="form-input"
                    placeholderText="dd/mm/yyyy"
                    style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }}
                  />
                </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">New Quantity Received</label>
                    <input type="text" className="form-input" name="dyeReceiptQuantity" value={formData.dyeReceiptQuantity} onChange={handleChange} placeholder="Enter quantity" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Entry Date</label>
                    <DatePicker
                      selected={formData.dyeReceiptDate ? new Date(formData.dyeReceiptDate) : null}
                      onChange={(date) => handleChange({ target: { name: 'dyeReceiptDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                      dateFormat="dd/MM/yyyy"
                      className="form-input"
                      placeholderText="dd/mm/yyyy"
                      style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Remark</label>
                    <input type="text" className="form-input" name="dyeReceiptRemark" value={formData.dyeReceiptRemark} onChange={handleChange} placeholder="Enter remark" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                  <button
                    type="button"
                    onClick={addDyeQuantityReceipt}
                    className="btn btn-secondary"
                    style={{ alignSelf: 'flex-end', padding: '14px 18px', borderRadius: '16px', backgroundColor: '#4F46E5', color: 'white', border: 'none' }}
                  >
                    Add Receipt Entry
                  </button>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#0F172A' }}>Received Quantity History</p>
                  {formData.dyeQuantityReceipts.length === 0 ? (
                    <p style={{ margin: 0, color: '#64748B' }}>No entries yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {formData.dyeQuantityReceipts.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '12px' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '700' }}>{formatDisplayDate(entry.entryDate)}</p>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
                              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Qty: {entry.quantity}</p>
                              {entry.remark && <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>• {entry.remark}</p>}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDyeReceipt(index)} style={{ color: '#EF4444', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ marginTop: '12px', color: '#475569', fontWeight: '600' }}>Dispatch Qty: {totalDyeReceived}</p>
                </div>
              </div>
            )}

            {(formData.fabricJobWorkMill === 'digitalPrinting' || formData.fabricJobWorkMill === 'both') && (
              <div className="card" style={{
                padding: '20px',
                borderRadius: '24px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0F172A' }}>Digital Printing & Value Addition Details</h3>
                <p style={{ margin: '8px 0 16px', color: '#475569', fontSize: '0.9rem' }}>Fill in the digital printing and value addition-specific fields below.</p>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Mill Name</label>
                    <input type="text" className="form-input" name="digitalMillName" value={formData.digitalMillName} onChange={handleChange} placeholder="Enter mill name" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Job Charge</label>
                    <input type="text" className="form-input" name="digitalJobCharge" value={formData.digitalJobCharge} onChange={handleChange} placeholder="Enter job charge" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Finish Quantity</label>
                    <input type="text" className="form-input" name="digitalFinishQuantity" value={formData.digitalFinishQuantity} onChange={handleChange} placeholder="Enter finish quantity" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Width</label>
                    <input type="text" className="form-input" name="digitalWidth" value={formData.digitalWidth} onChange={handleChange} placeholder="Enter width" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Design</label>
                    <input type="text" className="form-input" name="digitalDesign" value={formData.digitalDesign} onChange={handleChange} placeholder="Enter design" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Shortage</label>
                    <input type="text" className="form-input" name="digitalShortage" value={formData.digitalShortage} onChange={handleChange} placeholder="Enter shortage" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Delivery Date</label>
                  <DatePicker
                    selected={formData.digitalDeliveryDate ? new Date(formData.digitalDeliveryDate) : null}
                    onChange={(date) => handleChange({ target: { name: 'digitalDeliveryDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                    dateFormat="dd/MM/yyyy"
                    className="form-input"
                    placeholderText="dd/mm/yyyy"
                    style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }}
                  />
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">New Quantity Received</label>
                    <input type="text" className="form-input" name="digitalReceiptQuantity" value={formData.digitalReceiptQuantity} onChange={handleChange} placeholder="Enter quantity" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Entry Date</label>
                    <DatePicker
                      selected={formData.digitalReceiptDate ? new Date(formData.digitalReceiptDate) : null}
                      onChange={(date) => handleChange({ target: { name: 'digitalReceiptDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                      dateFormat="dd/MM/yyyy"
                      className="form-input"
                      placeholderText="dd/mm/yyyy"
                      style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Remark</label>
                    <input type="text" className="form-input" name="digitalReceiptRemark" value={formData.digitalReceiptRemark} onChange={handleChange} placeholder="Enter remark" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addDigitalQuantityReceipt}
                  className="btn btn-secondary"
                  style={{ padding: '14px 18px', borderRadius: '16px', backgroundColor: '#4F46E5', color: 'white', border: 'none', marginBottom: '16px' }}
                >
                  Add Receipt Entry
                </button>
                <div style={{ marginTop: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#0F172A' }}>Received Quantity History</p>
                  {formData.digitalQuantityReceipts.length === 0 ? (
                    <p style={{ margin: 0, color: '#64748B' }}>No entries yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {formData.digitalQuantityReceipts.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '12px' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '700' }}>{formatDisplayDate(entry.entryDate)}</p>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
                              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Qty: {entry.quantity}</p>
                              {entry.remark && <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>• {entry.remark}</p>}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDigitalReceipt(index)} style={{ color: '#EF4444', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ marginTop: '12px', color: '#475569', fontWeight: '600' }}>Total received: {totalDigitalReceived}</p>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', padding: '22px', borderRadius: '24px', backgroundColor: '#1F2937', border: '1px solid #334155', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: '800', color: '#FBBF24', letterSpacing: '0.02em' }}>Dispatch & Delivery</h3>
              <p style={{ margin: '0 0 18px 0', color: '#CBD5E1', fontSize: '0.95rem' }}>Use this section for final dispatch details and delivery notes.</p>
              <div className="flex gap-4 mb-4">
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#E2E8F0' }}>Date</label>
                  <DatePicker
                    selected={formData.dispatchDate ? new Date(formData.dispatchDate) : null}
                    onChange={(date) => handleChange({ target: { name: 'dispatchDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                    dateFormat="dd/MM/yyyy"
                    className="form-input"
                    placeholderText="dd/mm/yyyy"
                    style={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#E2E8F0', border: '1px solid #475569' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#E2E8F0' }}>Inv Number</label>
                  <input type="text" className="form-input" name="dispatchInvoiceNumber" value={formData.dispatchInvoiceNumber} onChange={handleChange} placeholder="Enter invoice number" style={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#E2E8F0', border: '1px solid #475569' }} />
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#E2E8F0' }}>Meter</label>
                  <input type="text" className="form-input" name="dispatchMeter" value={formData.dispatchMeter} onChange={handleChange} placeholder="Enter meters" style={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#E2E8F0', border: '1px solid #475569' }} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#E2E8F0' }}>Design / Colour</label>
                  <input type="text" className="form-input" name="dispatchDesignColour" value={formData.dispatchDesignColour} onChange={handleChange} placeholder="Enter design or colour" style={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#E2E8F0', border: '1px solid #475569' }} />
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label" style={{ color: '#E2E8F0' }}>Transport</label>
                <input type="text" className="form-input" name="transport" value={formData.transport} onChange={handleChange} placeholder="Enter transport" style={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#E2E8F0', border: '1px solid #475569' }} />
              </div>
              <div style={{ marginTop: '16px', padding: '18px', borderRadius: '20px', backgroundColor: '#111827', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#F8FAFC', fontSize: '0.95rem', fontWeight: '700' }}>New Quantity Received</h4>
                <div className="flex gap-4 mb-4">
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label" style={{ color: '#E2E8F0' }}>Entry Date</label>
                    <DatePicker
                      selected={formData.dispatchReceiptDate ? new Date(formData.dispatchReceiptDate) : null}
                      onChange={(date) => handleChange({ target: { name: 'dispatchReceiptDate', value: date ? date.toISOString().split('T')[0] : '' } })}
                      dateFormat="dd/MM/yyyy"
                      className="form-input"
                      placeholderText="dd/mm/yyyy"
                      style={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#E2E8F0', border: '1px solid #475569' }}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label" style={{ color: '#E2E8F0' }}>Quantity</label>
                    <input type="number" className="form-input" name="dispatchReceiptQuantity" value={formData.dispatchReceiptQuantity} onChange={handleChange} placeholder="Enter quantity" style={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#E2E8F0', border: '1px solid #475569' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label" style={{ color: '#E2E8F0' }}>Remark</label>
                    <input type="text" className="form-input" name="dispatchReceiptRemark" value={formData.dispatchReceiptRemark} onChange={handleChange} placeholder="Enter remark" style={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#E2E8F0', border: '1px solid #475569' }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addDispatchQuantityReceipt}
                  className="btn btn-secondary"
                  style={{ padding: '12px 18px', borderRadius: '16px', backgroundColor: '#4F46E5', color: 'white', border: 'none', marginBottom: '16px' }}
                >
                  Add Dispatch Receipt
                </button>
                <div style={{ marginTop: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#E2E8F0' }}>Received Quantity History</p>
                  {formData.dispatchQuantityReceipts.length === 0 ? (
                    <p style={{ margin: 0, color: '#94A3B8' }}>No dispatch receipt entries yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {formData.dispatchQuantityReceipts.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', borderRadius: '14px', border: '1px solid #334155', padding: '12px' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '700', color: '#F8FAFC' }}>{formatDisplayDate(entry.entryDate)}</p>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
                              <p style={{ margin: 0, color: '#94A3B8' }}>Qty: {entry.quantity}</p>
                              {entry.remark && <p style={{ margin: 0, color: '#94A3B8' }}>• {entry.remark}</p>}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDispatchReceipt(index)} style={{ color: '#F87171', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ marginTop: '12px', color: '#CBD5E1', fontWeight: '600' }}>Total received: {totalDispatchReceived}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              borderRadius: '24px',
              height: '64px',
              fontSize: '1.2rem',
              fontWeight: '800',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 12px 24px rgba(79, 70, 229, 0.3)',
              background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
              border: 'none'
            }}
          >
            <FileCheck size={24} />
            {loading ? 'Saving Order...' : 'Submit Full Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddOrder;
