import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintableCVContent from './PrintableCVContent';
import type { CVData } from '../types/cv';

interface PreviewPanelProps {
  data: CVData;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ data }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrintPDF = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${data.personalInfo.fullName} - CV`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.75in;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `
  });

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-white font-semibold text-sm">CV Preview</h2>
        <button
          onClick={() => handlePrintPDF()}
          className="no-print flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          title="Export as PDF"
        >
          <Download size={16} />
          PDF
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl" style={{ width: '794px', minHeight: '1123px' }}>
          <PrintableCVContent ref={componentRef} data={data} />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
