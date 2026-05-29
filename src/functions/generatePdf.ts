import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface GeneratePdfOptions {
  targetId: string;
  filename: string;
  onMissingTarget?: () => void;
}

export async function generatePdf({ targetId, filename, onMissingTarget }: GeneratePdfOptions) {
  console.log('[PDF] Start');
  const target = document.getElementById(targetId);
  if (!target) {
    console.error('[PDF] Target not found');
    onMissingTarget?.();
    return;
  }

  console.log('[PDF] Capturing html2canvas');
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    ignoreElements: (el) => el.tagName === 'SVG',
    onclone: (doc) => {
      doc.querySelectorAll('[data-pdf-hide]').forEach((el) => {
        if (el instanceof HTMLElement) el.style.display = 'none';
      });
      doc.querySelectorAll('[data-pdf-show]').forEach((el) => {
        if (el instanceof HTMLElement) el.style.display = 'block';
      });
      doc.querySelectorAll('svg').forEach((el) => {
        if (el instanceof HTMLElement) el.style.display = 'none';
      });
      doc.querySelectorAll('img').forEach((el) => {
        if (el instanceof HTMLElement) el.style.display = 'none';
      });
      doc.querySelectorAll('*').forEach((el) => {
        if (el instanceof HTMLElement) el.removeAttribute('style');
      });
      doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
        el.parentNode?.removeChild(el);
      });
      const style = doc.createElement('style');
      style.textContent = `
        html, body { width: 1280px !important; margin: 0; padding: 0; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; color: rgb(28, 25, 23); }
        * {
          color: rgb(17, 24, 39) !important;
          background-color: rgb(255, 255, 255) !important;
          border-color: rgb(231, 229, 228) !important;
          box-shadow: none !important;
        }
        h3 { font-size: 18px; font-weight: 700; margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid rgb(231, 229, 228); padding: 10px; font-size: 13px; }
        thead th { background-color: rgb(245, 245, 244) !important; text-transform: uppercase; font-size: 11px; color: rgb(120, 113, 108) !important; }
        [data-pdf-card] { border: 1px solid rgb(231,229,228); border-radius: 24px; padding: 28px; margin: 28px 0; }
        [data-pdf-title] { font-size: 18px; font-weight: 700; margin: 0 0 12px; }
        [data-pdf-space] { height: 20px; }
      `;
      doc.head.appendChild(style);
    },
  });
  console.log('[PDF] Canvas ready');

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = 0;
  let heightLeft = imgHeight;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  console.log('[PDF] Saving');
  pdf.save(filename);
  console.log('[PDF] Done');
}
