import { PDFPageProxy } from 'pdfjs-dist';
import { Annotation } from '../types/annotation';
import { drawAnnotation } from '../components/canvas/drawingUtils';

export const createExportCanvas = async (
  page: PDFPageProxy,
  scale: number,
  annotations: Annotation[]
) => {
  const exportCanvas = document.createElement('canvas');
  const viewport = page.getViewport({ scale });
  exportCanvas.width = viewport.width;
  exportCanvas.height = viewport.height;
  const ctx = exportCanvas.getContext('2d')!;

  // Render the PDF page
  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  // Draw annotations
  annotations.forEach(annotation => {
    drawAnnotation(ctx, annotation, scale);
  });

  return { canvas: exportCanvas, viewport };
};

export const exportToPNG = (canvas: HTMLCanvasElement, pageNumber: number) => {
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `page-${pageNumber}.png`;
  a.click();
};

export const exportToPDF = async (
  canvas: HTMLCanvasElement,
  viewport: { width: number; height: number },
  pageNumber: number
) => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: viewport.width > viewport.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [viewport.width, viewport.height]
  });

  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    0,
    0,
    viewport.width,
    viewport.height
  );
  pdf.save(`page-${pageNumber}.pdf`);
};