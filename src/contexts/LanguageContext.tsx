import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CVData } from '../types/cv';
import { uiTranslations, UITranslations } from '../data/uiTranslations';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  translatedCV: CVData | null;
  setTranslatedCV: (cv: CVData | null) => void;
  isTranslating: boolean;
  setIsTranslating: (value: boolean) => void;
  translationProgress: number;
  setTranslationProgress: (value: number) => void;
  translationCache: Map<string, CVData>;
  clearTranslationCache: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('Français');
  const [translatedCV, setTranslatedCV] = useState<CVData | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationCache] = useState<Map<string, CVData>>(new Map());
  const [currentUITranslations, setCurrentUITranslations] = useState<UITranslations>(
    uiTranslations['Français']
  );

  useEffect(() => {
    setCurrentUITranslations(uiTranslations[currentLanguage] || uiTranslations['Français']);
  }, [currentLanguage]);

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    setTranslationProgress(0);
  };

  const t = (key: string): string => {
    return currentUITranslations[key] || key;
  };

  const clearTranslationCache = () => {
    translationCache.clear();
    console.log('Translation cache cleared');
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        translatedCV,
        setTranslatedCV,
        isTranslating,
        setIsTranslating,
        translationProgress,
        setTranslationProgress,
        translationCache,
        clearTranslationCache,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
