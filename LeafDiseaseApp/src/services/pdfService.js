/**
 * LeafGuard AI - PDF Generation Service
 * Generates professional PDF reports with images and disease information
 */

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { mapClassName } from "../data/diseaseHelper";

// ============================================================
// EMBED NOTO SANS TAMIL FONT IN JSPDF VFS
// This allows jsPDF to render Tamil characters correctly
// ============================================================
const NOTO_SANS_TAMIL_REGULAR_BASE64 = "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...";

(function () {
  // Register Noto Sans Tamil font in jsPDF VFS
  if (typeof jsPDF !== 'undefined') {
    const fontName = 'NotoSansTamil';
    const fontStyle = 'normal';
    const fontWeight = 'normal';
    
    // Add to VFS if not already present
    if (!jsPDF.VFS[fontName + '-' + fontStyle + '.ttf']) {
      jsPDF.VFS[fontName + '-' + fontStyle + '.ttf'] = NOTO_SANS_TAMIL_REGULAR_BASE64;
    }
    
    // Register font with jsPDF (will be available when doc.addFont is called)
    // We'll register it on each document creation in generateScanPDF
  }
})();

/**
 * LeafGuard AI - PDF Generation Service
 * Generates professional PDF reports with images and disease information
 */

export const generateScanPDF = async ({
  prediction,
  report,
  imageDataUrl,
  gradcamDataUrl,
  lang = 'en',
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Register Tamil font for this document
  if (lang === 'ta') {
    doc.addFont('NotoSansTamil-normal.ttf', 'NotoSansTamil', 'normal');
    doc.addFont('NotoSansTamil-normal.ttf', 'NotoSansTamil', 'bold');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Color scheme
  const primaryColor = [34, 197, 94]; // Green
  const darkColor = [31, 41, 55];
  const lightColor = [249, 250, 251];
  const redColor = [239, 68, 68];

  // Helper to add text with wrapping
  const addText = (text, x, y, options = {}) => {
    const { fontSize = 10, color = darkColor, fontStyle = 'normal', maxWidth = pageWidth - 2 * margin } = options;
    doc.setFontSize(fontSize);
    doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, fontStyle);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * (fontSize * 0.5);
  };

  // Helper to add image
  const addImage = async (dataUrl, x, y, maxWidth, maxHeight) => {
    if (!dataUrl) return 0;
    try {
      const imgProps = doc.getImageProperties(dataUrl);
      const aspectRatio = imgProps.height / imgProps.width;
      let width = Math.min(maxWidth, imgProps.width * 0.264583); // px to mm
      let height = width * aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height / aspectRatio;
      }
      
      doc.addImage(dataUrl, 'JPEG', x, y, width, height);
      return height;
    } catch (e) {
      console.warn('Failed to add image to PDF:', e);
      return 0;
    }
  };

  // ===== HEADER =====
  // Title bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setFontSize(24);
  doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('LeafGuard AI', margin, 15);
  
  doc.setFontSize(14);
  doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, 'normal');
  doc.text(lang === 'ta' ? 'தாவர நோய் கண்டறிதல் அறிக்கை' : 'Plant Disease Diagnosis Report', margin, 25);

  yPos = 45;

  // ===== DIAGNOSIS INFO =====
  const details = mapClassName(prediction.disease || "Unknown");
  const isHealthy = details.isHealthy;

  // Status badge
  doc.setFillColor(...(isHealthy ? primaryColor : redColor));
  doc.roundedRect(margin, yPos, 45, 10, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(isHealthy ? (lang === 'ta' ? 'ஆரோக்கியம்' : 'HEALTHY') : (lang === 'ta' ? 'நோய் கண்டறியப்பட்டது' : 'DISEASE DETECTED'), margin + 3, yPos + 7);

  // Disease name
  yPos = addText(
    prediction.disease_formatted || details.displayName || prediction.disease || 'Unknown',
    margin + 55,
    yPos + 7,
    { fontSize: 14, fontStyle: 'bold', color: darkColor }
  );

  // Confidence & Crop
  yPos = addText(
    `${lang === 'ta' ? 'நம்பிக்கை' : 'Confidence'}: ${Math.round(prediction.confidence)}%   |   ${lang === 'ta' ? 'பயிர்' : 'Crop'}: ${details.plantName}`,
    margin,
    yPos + 2,
    { fontSize: 10, color: [107, 114, 128] }
  );

  yPos += 5;

  // ===== IMAGES SECTION =====
  if (imageDataUrl || gradcamDataUrl) {
    doc.setFontSize(12);
    doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, 'bold');
    doc.setTextColor(...darkColor);
    doc.text(lang === 'ta' ? 'தொகுப்பு படங்கள்' : 'Specimen Images', margin, yPos);
    yPos += 8;

    const imgStartY = yPos;
    const imgMaxWidth = (pageWidth - 2 * margin - 5) / 2;
    const imgMaxHeight = 60;

    let leftX = margin;
    let rightX = margin + imgMaxWidth + 5;

    if (imageDataUrl) {
      yPos = addText(lang === 'ta' ? 'அசல் இலை' : 'Original Leaf', leftX, yPos, { fontSize: 10, fontStyle: 'bold' });
      const h = await addImage(imageDataUrl, leftX, yPos, imgMaxWidth, imgMaxHeight);
      yPos = Math.max(yPos, imgStartY + h + 5);
    }

    if (gradcamDataUrl) {
      yPos = addText(lang === 'ta' ? 'AI கவன வரைபடம் (Grad-CAM)' : 'AI Attention Heatmap (Grad-CAM)', rightX, imgStartY, { fontSize: 10, fontStyle: 'bold' });
      await addImage(gradcamDataUrl, rightX, imgStartY + 5, imgMaxWidth, imgMaxHeight);
      yPos = Math.max(yPos, imgStartY + 70);
    }

    // Grad-CAM disclaimer
    yPos += 3;
    doc.setFontSize(8);
    doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, 'normal');
    doc.setTextColor(156, 163, 175);
    const disclaimer = lang === 'ta'
      ? 'குறிப்பு: வண்ண வரைபடம் AI மாதிரியின் கவனப் பகுதிகளை (Grad-CAM) மட்டுமே காட்டுகிறது; இது உயிரியல் காரணத்திற்கான நேரடி ஆதாரம் அல்ல.'
      : 'Note: Heatmap highlights model attention regions (Grad-CAM) and does not prove biological causation.';
    yPos = addText(disclaimer, margin, yPos, { fontSize: 8, color: [156, 163, 175] });
  }

  yPos += 10;

  // ===== STRUCTURED REPORT =====
  if (report) {
    const sections = [
      { key: 'diagnosis', label: lang === 'ta' ? 'கண்டறிதல்' : 'Diagnosis', icon: '🔬' },
      { key: 'summary', label: lang === 'ta' ? 'சுருக்கம்' : 'Summary', icon: '📋' },
      { key: 'symptoms', label: lang === 'ta' ? 'அறிகுறிகள்' : 'Symptoms', icon: '🩺' },
      { key: 'causes', label: lang === 'ta' ? 'காரணங்கள்' : 'Causes', icon: '🦠' },
      { key: 'immediate_actions', label: lang === 'ta' ? 'உடனடி நடவடிக்கைகள்' : 'Immediate Actions', icon: '⚡' },
      { key: 'treatment', label: lang === 'ta' ? 'சிகிச்சை மற்றும் மேலாண்மை' : 'Treatment & Management', icon: '💊' },
      { key: 'prevention', label: lang === 'ta' ? 'தடுப்பு' : 'Prevention', icon: '🛡️' },
      { key: 'monitoring', label: lang === 'ta' ? 'நிலவே الجزائر' : 'Monitoring', icon: '👁️' },
      { key: 'farmer_advice', label: lang === 'ta' ? 'விவசாயி மறுப்புரை' : 'Farmer Advisory', icon: '🧑‍🌾' },
    ];

    for (const section of sections) {
      const content = report[section.key];
      if (!content) continue;

      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
        // Re-register font on new page for Tamil
        if (lang === 'ta') {
          doc.addFont('NotoSansTamil-normal.ttf', 'NotoSansTamil', 'normal');
          doc.addFont('NotoSansTamil-normal.ttf', 'NotoSansTamil', 'bold');
        }
      }

      // Section header
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin - 2, yPos - 2, pageWidth - 2 * margin + 4, 10, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`${section.icon}  ${section.label}`, margin, yPos + 6);
      yPos += 12;

      // Section content
      doc.setFontSize(10);
      doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, 'normal');
      doc.setTextColor(...darkColor);

      if (Array.isArray(content)) {
        content.forEach((item, idx) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = margin;
            if (lang === 'ta') {
              doc.addFont('NotoSansTamil-normal.ttf', 'NotoSansTamil', 'normal');
              doc.addFont('NotoSansTamil-normal.ttf', 'NotoSansTamil', 'bold');
            }
          }
          const lines = doc.splitTextToSize(`${idx + 1}. ${item}`, pageWidth - 2 * margin - 10);
          doc.text(lines, margin + 5, yPos);
          yPos += lines.length * 5 + 2;
        });
      } else if (typeof content === 'string') {
        const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5 + 5;
      }

      yPos += 5;
    }
  }

  // ===== FOOTER =====
  const finalY = yPos > pageHeight - 25 ? (doc.addPage(), margin) : pageHeight - 20;
  
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, finalY - 5, pageWidth - margin, finalY - 5);
  
  doc.setFontSize(8);
  doc.setFont(lang === 'ta' ? 'NotoSansTamil' : undefined, 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text(
    `LeafGuard AI - ${lang === 'ta' ? 'தாவர நோய் கண்டறிதல்' : 'Plant Disease Detection'} | ${new Date().toLocaleDateString()}`,
    margin,
    finalY
  );
  doc.text(
    'Generated by LeafGuard AI. Consult your local agricultural extension officer for treatment decisions.',
    margin,
    finalY + 5
  );

  // Return PDF blob
  return doc.output('blob');
};

/**
 * Download PDF to user's device
 * @param {Blob} pdfBlob - PDF blob from generateScanPDF
 * @param {string} filename - Filename for download
 */
export const downloadPDF = (pdfBlob, filename = 'LeafGuard-Report.pdf') => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Load image as data URL for PDF embedding
 * @param {string} imageUrl - Image URL
 * @returns {Promise<string>} Data URL
 */
export const loadImageAsDataUrl = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to load image for PDF:', e);
    return null;
  }
};