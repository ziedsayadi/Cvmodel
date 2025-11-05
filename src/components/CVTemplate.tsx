import React, { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Languages } from 'lucide-react';
import { CV_DATA } from '../data/cvData';
import PrintableCVContent from './PrintableCVContent';
import type { CVData } from '../types/cv';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslate } from '../hooks/useTranslate';
import Spinner from './Spinner';
import { rebuildJSON } from '../utils/chunkHelpers';

interface CVTemplateProps {
  data?: CVData;
}

const CVTemplate: React.FC<CVTemplateProps> = ({ data = CV_DATA }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { currentLanguage, setLanguage, translatedCV, setTranslatedCV, t } = useLanguage();
  const { translateStream, isTranslating, progress } = useTranslate();

  const displayData = translatedCV || data;

  useEffect(() => {
    if (currentLanguage === 'Français') {
      setTranslatedCV(null);
      return;
    }

    let assembledText = '';
    let abortTranslation: (() => void) | null = null;

    abortTranslation = translateStream(
      currentLanguage,
      data,
      (partialText) => {
        assembledText = partialText;
        try {
          const partial = rebuildJSON(assembledText);
          setTranslatedCV(partial);
        } catch {
          // Not valid yet
        }
      },
      (result) => {
        setTranslatedCV(result);
      }
    );

    return () => {
      if (abortTranslation) abortTranslation();
    };
  }, [currentLanguage, data]);



  const handlePrintPDF = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${displayData.personalInfo.fullName} - CV`,
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
    setLanguage('Français');
    setTranslatedCV(null);
  };

  if (isTranslating && progress.percentage < 10) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">{t('translating')}</p>
          {progress.total > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {progress.current} / {progress.total} chunks ({progress.percentage}%)
            </p>
          )}
        </div>
      </div>
    );
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

      {isTranslating && progress.percentage >= 10 && (
        <div className="no-print fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">{t('translating')}</span>
            <span className="text-sm text-gray-500">
              {progress.percentage}%
            </span>
          </div>
          <div className="mt-2 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="no-print fixed top-6 right-6 z-50 flex gap-3">
        {/* Language selector with icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Languages size={18} className="text-gray-600" />
          </div>
          <select
            value={currentLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isTranslating}
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
<<<<<<< HEAD
            <option value="French">Français</option>
=======
            <option value="Français">Français</option>
>>>>>>> faadcf2 (ùtest commit)
            <option value="English">English</option>
            <option value="Arabic">العربية</option>
            <option value="German">Deutsch</option>
            <option value="Spanish">Español</option>
          </select>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          disabled={isTranslating}
          className="px-4 py-2.5 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600 
                   transition-all duration-200 hover:scale-105 font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Reset
        </button>

        {/* Print button */}
        <button
          onClick={handlePrintPDF}
          disabled={isTranslating}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4590e6] text-white rounded-lg shadow-lg 
                   hover:bg-blue-600 transition-all duration-200 hover:scale-105 font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={t('exportPdf')}
        >
          <Download size={18} />
          {t('exportPdf')}
        </button>
      </div>

      {/* CV Content */}
      <div className="flex justify-center items-center py-10">
        <PrintableCVContent ref={componentRef} data={displayData} />
      </div>
    </div>
  );
};

export default CVTemplate;
