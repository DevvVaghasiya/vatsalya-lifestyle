import React from 'react';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invoice = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="header">
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1>Invoice Preview</h1>
        <div style={{ width: 24 }}></div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex gap-4 items-start mb-6 border-b" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--primary-light)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '24px' }}>
              V
            </div>
            <div>
              <h3 className="font-bold text-dark text-sm mb-1">VATSALYA LIFESTYLE</h3>
              <p className="text-xs text-gray">Factory Area, Surat, Gujarat</p>
              <p className="text-xs text-gray">GSTIN: 24ABCDE1234F1Z5</p>
              <p className="text-xs text-gray">+91 98765 43210</p>
            </div>
          </div>

          <div className="flex justify-between mb-6">
            <div>
              <p className="text-xs font-medium text-gray mb-1">Bill To:</p>
              <h4 className="font-bold text-dark text-sm">Shree Ram Textiles</h4>
              <p className="text-xs text-gray">Surat, Gujarat</p>
            </div>
            <div className="text-right">
              <h4 className="font-bold text-primary text-sm mb-1">INVOICE</h4>
              <p className="text-xs text-dark font-medium mb-1"># INV-1012</p>
              <p className="text-xs text-gray">Date: 21 May 2024</p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div className="flex text-xs font-semibold text-gray mb-2 border-b" style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 2 }}>Item</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Qty (Mtr)</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Rate</div>
              <div style={{ flex: 1, textAlign: 'right' }}>Amount</div>
            </div>
            <div className="flex text-xs text-dark py-2">
              <div style={{ flex: 2 }}>Cotton Fabric</div>
              <div style={{ flex: 1, textAlign: 'center' }}>500</div>
              <div style={{ flex: 1, textAlign: 'center' }}>150</div>
              <div style={{ flex: 1, textAlign: 'right' }}>75,000</div>
            </div>
          </div>

          <div className="flex-col gap-2 border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', marginBottom: '24px' }}>
            <div className="flex justify-between text-xs text-gray">
              <span>Subtotal</span>
              <span className="text-dark font-medium">75,000</span>
            </div>
            <div className="flex justify-between text-xs text-gray">
              <span>CGST (2.5%)</span>
              <span className="text-dark font-medium">1,875</span>
            </div>
            <div className="flex justify-between text-xs text-gray">
              <span>SGST (2.5%)</span>
              <span className="text-dark font-medium">1,875</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-dark mt-2 pt-2 border-t" style={{ borderTop: '1px solid var(--border)' }}>
              <span>Total Amount</span>
              <span>₹78,750</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray font-medium mb-1">Amount In Words:</p>
            <p className="text-xs text-dark">Seventy Eight Thousand Seven Hundred Fifty Only</p>
            <p className="text-xs text-primary font-medium mt-4">Thank you for your business!</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4" style={{ padding: '20px' }}>
        <button className="btn btn-primary" style={{ flex: 1 }}>
          Download PDF
        </button>
        <button className="btn" style={{ width: '50px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', flexShrink: 0 }}>
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Invoice;
