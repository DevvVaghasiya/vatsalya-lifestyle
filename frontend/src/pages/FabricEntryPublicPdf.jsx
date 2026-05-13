import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { API_BASE } from '../utils/api';

const API = `${API_BASE}/api/inventory`;

const safePdfText = (v) => {
  const s = (v ?? '').toString().trim();
  return s.length ? s : 'N/A';
};

const buildFabricPdf = (item) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let currentY = 60;
  const rowH = 34;
  const tableWidth = pageWidth - marginX * 2;
  const col1W = Math.floor(tableWidth * 0.40);

  doc.setDrawColor(200);
  doc.setLineWidth(1);
  doc.rect(marginX, 40, tableWidth, 450);

  doc.setFillColor(79, 70, 229);
  doc.rect(marginX, 40, tableWidth, 50, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('VATSALYA LIFESTYLE LLP', pageWidth / 2, 72, { align: 'center' });

  currentY = 90;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, currentY, tableWidth, 30, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, currentY + 30, marginX + tableWidth, currentY + 30);
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('FABRIC SPECIFICATION SHEET', pageWidth / 2, currentY + 20, { align: 'center' });
  currentY += 30;

  const rows = [
    ['Reference Number', safePdfText(item.referenceNo)],
    ['Fabric Name', safePdfText(item.fabricName)],
    ['Composition', safePdfText(item.composition)],
    ['GSM (Weight)', safePdfText(item.gsm)],
    ['Width', safePdfText(item.width)],
    ['Fabric Type', safePdfText(item.fabricType)],
    ['Count / Const', safePdfText(item.countConst)],
  ];

  doc.setFontSize(11);
  for (let i = 0; i < rows.length; i++) {
    const y = currentY + (i * rowH);
    if (i % 2 === 0) {
      doc.setFillColor(252, 253, 255);
      doc.rect(marginX + 1, y, tableWidth - 2, rowH, 'F');
    }
    doc.setDrawColor(235);
    doc.line(marginX, y + rowH, marginX + tableWidth, y + rowH);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(String(rows[i][0]), marginX + 20, y + 22);
    doc.setTextColor(30, 41, 59);
    doc.text(String(rows[i][1]), marginX + col1W + 10, y + 22);
  }

  return doc;
};

const FabricEntryPublicPdf = () => {
  const { id } = useParams();
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    let objectUrl = '';
    const run = async () => {
      try {
        const res = await axios.get(`${API}/${id}`);
        const doc = buildFabricPdf(res.data || {});
        const blob = doc.output('blob');
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch {
        setError('Unable to open PDF');
      }
    };
    run();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (!pdfUrl) return <div style={{ padding: 24 }}>Preparing PDF...</div>;

  return (
    <iframe
      title="Fabric Entry PDF"
      src={pdfUrl}
      style={{ width: '100vw', height: '100vh', border: 'none' }}
    />
  );
};

export default FabricEntryPublicPdf;
