import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Save } from 'lucide-react';
import FormPanel from './FormPanel';
import PreviewPanel from './PreviewPanel';
import type { CVData } from '../types/cv';

interface SplitScreenEditorProps {
  data: CVData;
  onUpdate: (data: CVData) => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
}

const SplitScreenEditor: React.FC<SplitScreenEditorProps> = ({
  data,
  onUpdate,
  onSave,
  hasUnsavedChanges
}) => {
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newWidth > 25 && newWidth < 75) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
    };
  }, [isDragging]);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cv-${data.personalInfo.fullName.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900" ref={containerRef}>
      <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-gray-700">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">CV Editor</h1>
          {hasUnsavedChanges && (
            <span className="text-xs bg-yellow-600 px-2 py-1 rounded">Unsaved Changes</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
            title="Export JSON"
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            onClick={onSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              hasUnsavedChanges
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title="Save Changes"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {isLeftPanelVisible && (
          <div
            className="bg-gray-800 border-r border-gray-700 overflow-hidden flex flex-col"
            style={{ width: `${leftPanelWidth}%` }}
          >
            <FormPanel data={data} onUpdate={onUpdate} />
          </div>
        )}

        <div
          className={`w-1 bg-gray-700 hover:bg-blue-600 transition-colors cursor-col-resize ${
            isDragging ? 'bg-blue-600' : ''
          }`}
          onMouseDown={() => setIsDragging(true)}
        />

        <div className="flex-1 bg-gray-900 overflow-hidden flex items-center justify-center relative">
          <button
            onClick={() => setIsLeftPanelVisible(!isLeftPanelVisible)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            title={isLeftPanelVisible ? 'Hide Editor' : 'Show Editor'}
          >
            {isLeftPanelVisible ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>

          <PreviewPanel data={data} />
        </div>
      </div>
    </div>
  );
};

export default SplitScreenEditor;
