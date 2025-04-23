import React, { useState, useEffect, useCallback } from 'react';
import {
  getVocabulary,
  getSetting,
  updateSetting as dbUpdateSetting,
  TextEntry
} from './db/database'; // Import specific functions and types
import HomePage from './components/HomePage/HomePage';
import Settings from './components/Settings/Settings';
import Reader from './components/Reader/Reader';
import { Word } from './types/index'; // Keep Word type for component props
import styles from './App.module.css';

// Define Page type
type Page = 'home' | 'reader' | 'settings';

const App: React.FC = () => {
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [page, setPage] = useState<Page>('home');
  const [selectedText, setSelectedText] = useState<TextEntry | null>(null); // Use TextEntry type
  const [fontSize, setFontSize] = useState<number>(20); // Default font size

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vocabData, fontSizeSetting] = await Promise.all([
          getVocabulary(),
          getSetting('fontSize')
        ]);
        setKnownWords(vocabData); // Directly use VocabularyEntry[] which matches Word[]
        if (fontSizeSetting) {
          setFontSize(fontSizeSetting.value as number);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        // Handle error appropriately, maybe show a message to the user
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

  // Navigate back to Home page from Reader
  const handleBackFromReader = useCallback(() => {
    setSelectedText(null);
    setPage('home');
  }, []);

  // Update known words state (passed down to Reader/Settings)
  const handleSetKnownWords = useCallback((words: Word[]) => {
    // This function now just updates the state. DB operations are handled within components.
    setKnownWords(words);
  }, []);

  return (
    <div className={styles.app} style={{ fontSize: `${fontSize}px` }}>
      <nav className={styles.nav}>
        {/* Use a button or link for navigation for accessibility */}
        <button onClick={() => setPage('home')} className={styles.navTitleButton}>Mandaread</button>
        <div className={styles.navButtons}>
          <button onClick={() => setPage('home')} disabled={page === 'home'}>Home</button>
          <button onClick={() => setPage('settings')} disabled={page === 'settings'}>Settings</button>
        </div>
      </nav>

      {/* Conditional Rendering based on page state */}
      {page === 'home' && (
        <HomePage onSelect={handleSelectText} />
      )}
      {page === 'reader' && selectedText && (
        <Reader
          text={selectedText}
          knownWords={knownWords}
          setKnownWords={handleSetKnownWords} // Pass the state updater
          onBack={handleBackFromReader}
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
