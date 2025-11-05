import { useState, useRef } from 'react';
import CVTemplate from './components/CVTemplate';
import CVEditor from './components/CVEditor';
import { useCVData } from './hooks/useCVData';
import { processPDFToCV } from './utils/pdfExtractor';
import { useLanguage } from './contexts/LanguageContext';
import Spinner from './components/Spinner';

function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cvData, updateCVData, saveCVData, resetCVData, createNewCV, loadCVData, hasUnsavedChanges } = useCVData();
  const { t, translatedCV, setTranslatedCV, clearTranslationCache } = useLanguage();

  const displayData = translatedCV || cvData;

  // Clear translation cache when CV data changes
  const handleCVUpdate = (newData: typeof cvData) => {
    updateCVData(newData);
    clearTranslationCache();
    setTranslatedCV(null);
  };

  const handleSave = () => {
    const success = saveCVData();
    if (success) {
      alert('CV sauvegardé avec succès!');
    } else {
      alert('Erreur lors de la sauvegarde du CV.');
    }
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les modifications?')) {
      resetCVData();
      alert('CV réinitialisé aux valeurs par défaut.');
    }
  };

  const handleToggleMode = () => {
    if (isEditMode && hasUnsavedChanges) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous continuer?')) {
        setIsEditMode(!isEditMode);
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleNewCV = () => {
    if (confirm('Êtes-vous sûr de vouloir créer un nouveau CV vide? Toutes les données actuelles seront effacées.')) {
      createNewCV();
      setIsEditMode(true);
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier PDF valide.');
      return;
    }

    try {
      setIsProcessingPDF(true);
      const extractedData = await processPDFToCV(file);
      loadCVData(extractedData);
      setIsEditMode(true);
      alert('CV extrait avec succès! Vous pouvez maintenant le modifier.');
    } catch (error) {
      console.error('PDF processing error:', error);
      alert('Erreur lors de l\'extraction du CV. Assurez-vous que le serveur est démarré (npm run dev dans le dossier server).');
    } finally {
      setIsProcessingPDF(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isProcessingPDF) {
    return <Spinner />;
  }

  return (
    <div className="App">
      {isEditMode ? (
        <CVEditor
          data={cvData}
          onUpdate={handleCVUpdate}
          onSave={handleSave}
          onReset={handleReset}
          onTogglePreview={handleToggleMode}
          isPreviewMode={false}
        />
      ) : (
        <div className="relative">
          <div className="no-print fixed top-6 left-6 z-50 flex gap-3">
            <button
              onClick={handleToggleMode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 transition-all duration-200 hover:scale-105"
              title={t('edit')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              {t('edit')}
            </button>

            <button
              onClick={handleNewCV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 hover:scale-105"
              title={t('newCv')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              {t('newCv')}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
              title={t('uploadPdf')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {t('uploadPdf')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handlePDFUpload}
              className="hidden"
            />
          </div>
          <CVTemplate data={cvData} />
        </div>
      )}
    </div>
  );
}

export default App;
