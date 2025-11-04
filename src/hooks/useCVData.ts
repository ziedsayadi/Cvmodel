import { useState, useEffect, useCallback, useRef } from 'react';
import { CVData } from '../types/cv';
import { CV_DATA } from '../data/cvData';
import { migrateLegacyData, createEmptyCV } from '../utils/cvHelpers';

const STORAGE_KEY = 'cv-data';
const AUTOSAVE_DELAY = 2000;

export const useCVData = () => {
  const [cvData, setCvData] = useState<CVData>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return migrateLegacyData(parsed);
      } catch (error) {
        console.error('Error parsing saved CV data:', error);
        return CV_DATA;
      }
    }
    return CV_DATA;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        saveCVData();
      }, AUTOSAVE_DELAY);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [cvData, hasUnsavedChanges, autoSaveEnabled]);

  const updateCVData = useCallback((newData: CVData) => {
    setCvData(newData);
    setHasUnsavedChanges(true);
  }, []);

  const saveCVData = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error saving CV data:', error);
      return false;
    }
  }, [cvData]);

  const resetCVData = useCallback(() => {
    setCvData(CV_DATA);
    localStorage.removeItem(STORAGE_KEY);
    setHasUnsavedChanges(false);
  }, []);

  const createNewCV = useCallback(() => {
    const emptyCV = createEmptyCV();
    setCvData(emptyCV);
    localStorage.removeItem(STORAGE_KEY);
    setHasUnsavedChanges(false);
  }, []);

  const loadCVData = useCallback((data: CVData) => {
    const migratedData = migrateLegacyData(data);
    setCvData(migratedData);
    setHasUnsavedChanges(true);
  }, []);

  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
  }, []);

  return {
    cvData,
    updateCVData,
    saveCVData,
    resetCVData,
    createNewCV,
    loadCVData,
    hasUnsavedChanges,
    autoSaveEnabled,
    toggleAutoSave
  };
};
