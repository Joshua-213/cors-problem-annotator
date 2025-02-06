import React, { useRef, useState, useEffect } from "react";
import { AnnotationCanvas } from "./AnnotationCanvas";
import { useAnnotationStore } from "../store/useAnnotationStore";
import { PDFControls } from "./PDFViewer/PDFControls";
import { usePDFDocument } from "../hooks/usePDFDocument";
import { usePDFPage } from "../hooks/usePDFPage";
import {
  createExportCanvas,
  exportToPNG,
  exportToPDF,
} from "../utils/exportUtils";
import { drawAnnotation } from "./canvas/drawingUtils";

interface PDFViewerProps {
  file: File | null;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { annotations } = useAnnotationStore();

  const { pdf, error: pdfError } = usePDFDocument(file);
  const { page, error: pageError } = usePDFPage(pdf, currentPage, scale);

  useEffect(() => {
    if (!page || !canvasRef.current) return;

    const renderPage = async () => {
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    };

    renderPage();
  }, [page, scale]);

  const exportAllPages = async () => {
    if (!pdf) return;
    setIsExporting(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
      });

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        // Create temporary canvas for each page
        const tempCanvas = document.createElement("canvas");
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const ctx = tempCanvas.getContext("2d")!;

        // Render PDF page
        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        // Draw annotations for this page
        const pageAnnotations = annotations.filter(
          (a) => a.pageNumber === pageNum
        );
        pageAnnotations.forEach((annotation) => {
          drawAnnotation(ctx, annotation, scale);
        });

        // Add page to PDF
        if (pageNum > 1) {
          doc.addPage([viewport.width, viewport.height]);
        }
        doc.addImage(
          tempCanvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          viewport.width,
          viewport.height
        );
      }

      doc.save("annotated-document.pdf");
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(p + 1, pdf?.numPages || p));
  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  const exportCurrentPage = async (format: "png" | "pdf") => {
    if (!page || !canvasRef.current) return;

    const pageAnnotations = annotations.filter(
      (a) => a.pageNumber === currentPage
    );
    const { canvas, viewport } = await createExportCanvas(
      page,
      scale,
      pageAnnotations
    );

    if (format === "png") {
      exportToPNG(canvas, currentPage);
    } else {
      await exportToPDF(canvas, viewport, currentPage);
    }
  };

  if (pdfError || pageError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">
          Error loading PDF: {pdfError?.message || pageError?.message}
        </p>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No PDF loaded</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      <PDFControls
        currentPage={currentPage}
        totalPages={pdf.numPages}
        scale={scale}
        isExporting={isExporting}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExportCurrentPage={exportCurrentPage}
        onExportAllPages={exportAllPages}
      />
      <div className="relative flex-1 overflow-auto">
        <div className="relative inline-block">
          <canvas ref={canvasRef} className="shadow-lg" />
          <AnnotationCanvas
            pageNumber={currentPage}
            scale={scale}
            width={canvasRef.current?.width || 0}
            height={canvasRef.current?.height || 0}
          />
        </div>
      </div>
    </div>
  );
};
