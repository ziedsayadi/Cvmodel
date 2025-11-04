import React, { useRef, useState, useEffect } from 'react'; 
import { useReactToPrint } from 'react-to-print';
import { Download, Languages } from 'lucide-react';
import { CV_DATA } from '../data/cvData';
import PrintableCVContent from './PrintableCVContent';
import type { CVData } from '../types/cv';
import { translateCV } from '../Api/translate';
import { translateCVStream } from "../utils/translateCVStream"; 
import Spinner from './Spinner';

interface CVTemplateProps {
  data?: CVData;
}

const CVTemplate: React.FC<CVTemplateProps> = ({ data = CV_DATA }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [cvData, setCvData] = useState<CVData>(data);
  const [lang, setLang] = useState<string>('French');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

 // ✅ REAL-TIME STREAMING TRANSLATION

  useEffect(() => {
    if (pageLoading) return;

    if (lang === "Français") {
      setCvData(data);
      return;
    }

    let assembledText = "";

    setLoading(true);

    translateCVStream(
      lang,
      data,
      (partialChunk) => {
        assembledText += partialChunk;

        const tryJson = assembledText
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]");

        try {
          const json = JSON.parse(tryJson);
          setCvData(json);
        } catch {
          // Not valid JSON yet
        }
      },
      () => {
        setLoading(false);
        console.log("✅ Stream translation completed");
      }
    ).catch((error) => {
      // ✅ Add error handling
      console.error("Translation error:", error);
      setLoading(false);
      alert(`Translation failed: ${error.message}. Please try again.`);
      setLang("Français"); // Reset to French on error
    });
  }, [lang, pageLoading, data]);



  const handlePrintPDF = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${cvData.personalInfo.fullName} - CV`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0.75in;
        @bottom-center {
          content: "Page " counter(page) "/" counter(pages);
          font-size: 10px;
          color: #666;
        }
      }
      html { counter-reset: page; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print\\:break-before-page { page-break-before: always !important; }
        .print\\:m-0 { margin: 0 !important; }
        .page-number {
          position: fixed;
          bottom: 0.5in;
          right: 0.75in;
          font-size: 10px;
          color: #666;
        }
        .page-number::after { content: counter(page); }
        * { box-sizing: border-box; }
      }
    `
  });

  const handleReset = () => {
    setLang('French');
    setCvData(data);
  };

  // Show spinner during page load or translation
  if (pageLoading || loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-indigo-100 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-200 transform rotate-45 opacity-25"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-indigo-200 transform rotate-12 opacity-20"></div>
      </div>

      {/* Controls */}
      <div className="no-print fixed top-6 right-6 z-50 flex gap-3">
        {/* Language selector with icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Languages size={18} className="text-gray-600" />
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={loading}
            className="pl-10 pr-8 py-2.5 bg-white border-2 border-gray-300 rounded-lg shadow-sm 
                     hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                     transition-all duration-200 cursor-pointer appearance-none font-medium text-gray-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
            }}
          >
            <option value="French">Français</option>
            <option value="English">English</option>
            <option value="Arabic">العربية</option>
            <option value="German">Deutsch</option>
            <option value="Spanish">Español</option>
          </select>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-2.5 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600 
                   transition-all duration-200 hover:scale-105 font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Reset
        </button>

        {/* Print button */}
        <button
          onClick={handlePrintPDF}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4590e6] text-white rounded-lg shadow-lg 
                   hover:bg-blue-600 transition-all duration-200 hover:scale-105 font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Export to PDF"
        >
          <Download size={18} />
          PDF
        </button>
      </div>

      {/* CV Content */}
      <div className="flex justify-center items-center py-10">
        <PrintableCVContent ref={componentRef} data={cvData} />
      </div>
    </div>
  );
};

export default CVTemplate;
