import React from 'react';
import { Download } from 'lucide-react';

interface PDFControlsProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  isExporting: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExportCurrentPage: (format: 'png' | 'pdf') => void;
  onExportAllPages: () => void;
}

export const PDFControls: React.FC<PDFControlsProps> = ({
  currentPage,
  totalPages,
  scale,
  isExporting,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onExportCurrentPage,
  onExportAllPages,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onZoomOut}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Zoom Out
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button
          onClick={onZoomIn}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Zoom In
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white border rounded-lg shadow-sm divide-x">
          <button
            onClick={() => onExportCurrentPage('png')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-l-lg"
            title="Export current page as PNG"
          >
            <Download size={16} className="text-blue-500" />
            PNG
          </button>
          <button
            onClick={() => onExportCurrentPage('pdf')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            title="Export current page as PDF"
          >
            <Download size={16} className="text-red-500" />
            PDF
          </button>
          <button
            onClick={onExportAllPages}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            title="Export all pages as PDF"
          >
            <Download size={16} className="text-green-500" />
            {isExporting ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                Exporting...
              </span>
            ) : (
              'All Pages'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};