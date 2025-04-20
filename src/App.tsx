import React, { useState, useEffect, useCallback } from 'react';
import {
  getVocabulary,
  addText as dbAddText,
  getSetting,
  updateSetting as dbUpdateSetting,
  TextEntry
} from './db/database'; // Import specific functions and types
import HomePage from './components/HomePage/HomePage';
import Settings from './components/Settings/Settings';
import Reader from './components/Reader/Reader';
import { v4 as uuidv4 } from 'uuid';
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

  // Handle JSON file import for new texts
  const handleImportJSON = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const title = prompt('Enter a title for this text:') || `Untitled Text ${new Date().toLocaleTimeString()}`;
      const id = uuidv4();
      const newText: TextEntry = { id, title, content };

      try {
        await dbAddText(newText);
        // Optionally, refresh the text list if HomePage doesn't auto-refresh
        setPage('home'); // Navigate home to see the new text
      } catch (error) {
        console.error("Error adding new text:", error);
        alert("Failed to import text. Please check the console for details.");
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Failed to read the selected file.");
    };
    reader.readAsText(file);

    // Reset file input value to allow importing the same file again
    event.target.value = '';
  }, []);

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

  // Trigger file input click
  const triggerImport = useCallback(() => {
    document.getElementById('import-input')?.click();
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
        <HomePage onSelect={handleSelectText} onImport={triggerImport} />
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

      {/* Hidden file input */}
      <input
        id="import-input"
        type="file"
        accept="application/json"
        className={styles.hiddenInput}
        onChange={handleImportJSON}
        aria-hidden="true" // Hide from accessibility tree as it's triggered by a button
      />
    </div>
  );
};

export default App;
