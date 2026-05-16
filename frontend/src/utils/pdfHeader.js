import { logoBase64 } from './logoBase64';

export const addPdfHeader = (doc, title) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background
  doc.setFillColor(79, 70, 229); // Primary Indigo
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo on the left
  try {
    // x: 10, y: 5, width: 30, height: 30 (adjust as needed)
    doc.addImage(logoBase64, 'JPEG', 10, 5, 30, 30);
  } catch (err) {
    console.error('Error adding logo to PDF:', err);
  }
  
  // "VATTSALYA LIFESTYLE LLP" in the middle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VATSALYA LIFESTYLE LLP', pageWidth / 2, 22, { align: 'center' });
  
  // Subtitle/Title on the right or below (if provided)
  if (title) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(title, pageWidth - 10, 25, { align: 'right' });
  }
  
  // Bottom border of header
  doc.setDrawColor(67, 56, 202);
  doc.setLineWidth(0.5);
  doc.line(0, 40, pageWidth, 40);
  
  return 55; // Return next Y position
};
