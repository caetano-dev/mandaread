import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getVocabulary, getSetting, updateSetting as dbUpdateSetting } from '../db/database';
import { Word } from '../types/index';

interface AppContextType {
  knownWords: Word[];
  setKnownWords: (words: Word[]) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [fontSize, setFontSize] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vocabData, fontSizeSetting] = await Promise.all([
          getVocabulary(),
          getSetting('fontSize')
        ]);
        setKnownWords(vocabData);
        if (fontSizeSetting) {
          setFontSize(fontSizeSetting.value as number);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        alert("Failed to load initial data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Update font size setting in DB when it changes
  useEffect(() => {
    if (!isLoading) {
      const saveFontSize = async () => {
        try {
          await dbUpdateSetting({ key: 'fontSize', value: fontSize });
        } catch (error) {
          console.error("Error saving font size:", error);
        }
      };
      saveFontSize();
    }
  }, [fontSize, isLoading]);

  // Update known words state (passed down to components)
  const handleSetKnownWords = useCallback((words: Word[]) => {
    setKnownWords(words);
  }, []);

  const handleSetFontSize = useCallback((size: number) => {
    setFontSize(size);
  }, []);

  return (
    <AppContext.Provider value={{
      knownWords,
      setKnownWords: handleSetKnownWords,
      fontSize,
      setFontSize: handleSetFontSize,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};