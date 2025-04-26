import React, { useState, useEffect, useCallback } from 'react';
import {
  getVocabulary,
  getSetting,
  updateSetting as dbUpdateSetting,
  TextEntry
} from './db/database'; 
import HomePage from './components/HomePage/HomePage';
import Settings from './components/Settings/Settings';
import Reader from './components/Reader/Reader';
import NavBar from './components/NavBar/NavBar'; 
import { Word } from './types/index'; 
import styles from './App.module.css';

// Define Page type
type Page = 'home' | 'reader' | 'settings';

const App: React.FC = () => {
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [page, setPage] = useState<Page>('home');
  const [selectedText, setSelectedText] = useState<TextEntry | null>(null); 
  const [fontSize, setFontSize] = useState<number>(20);

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
      }
    };
    loadInitialData();
  }, []);

  // Update font size setting in DB when it changes
  useEffect(() => {
    const saveFontSize = async () => {
      try {
        await dbUpdateSetting({ key: 'fontSize', value: fontSize });
      } catch (error) {
        console.error("Error saving font size:", error);
      }
    };
    saveFontSize();
  }, [fontSize]);

  // Navigate to Reader page
  const handleSelectText = useCallback((text: TextEntry) => {
    setSelectedText(text);
    setPage('reader');
  }, []);

  // Update known words state (passed down to Reader/Settings)
  const handleSetKnownWords = useCallback((words: Word[]) => {
    // This function now just updates the state. DB operations are handled within components.
    setKnownWords(words);
  }, []);

  return (
    <div className={styles.app} style={{ fontSize: `${fontSize}px` }}>
      {/* Use the NavBar component */}
      <NavBar page={page} setPage={setPage} />

      {/* Conditional Rendering based on page state */}
      {page === 'home' && (
        <HomePage onSelect={handleSelectText} />
      )}
      {page === 'reader' && selectedText && (
        <Reader
          text={selectedText}
          knownWords={knownWords}
          setKnownWords={handleSetKnownWords} // Pass the state updater
        />
      )}
      {page === 'settings' && (
        <Settings
          knownWords={knownWords}
          setKnownWords={handleSetKnownWords} // Pass the state updater
          fontSize={fontSize}
          setFontSize={setFontSize}
        />
      )}
    </div>
  );
};

export default App;
