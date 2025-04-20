import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  clearVocabulary as dbClearVocabulary,
  bulkAddVocabulary as dbBulkAddVocabulary,
  deleteWordFromVocabulary as dbDeleteWordFromVocabulary,
  VocabularyEntry
} from '../../db/database';
import styles from './Settings.module.css';
import { Word } from '../../types/index';

// Helper to validate imported vocabulary data
const isValidVocabularyImport = (data: any): data is Word[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.hanzi === 'string' &&
        typeof item.pinyin === 'string' &&
        typeof item.translation === 'string'
    )
  );
};

interface SettingsProps {
  knownWords: Word[];
  setKnownWords: (words: Word[]) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ knownWords, setKnownWords, fontSize, setFontSize }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Memoize filtered words based on search query
  const filteredWords = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return knownWords;
    }
    return knownWords.filter(word =>
      word.hanzi.toLowerCase().includes(query) ||
      word.pinyin.toLowerCase().includes(query) ||
      word.translation.toLowerCase().includes(query)
    );
  }, [knownWords, searchQuery]);

  // Export vocabulary to JSON
  const handleExport = useCallback(() => {
    setIsExporting(true);
    try {
      // Ensure the exported data matches the Word structure
      const dataToExport: Word[] = knownWords.map(w => ({ hanzi: w.hanzi, pinyin: w.pinyin, translation: w.translation }));
      const data = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mandaread_vocabulary.json'; // More specific filename
      a.click();
      URL.revokeObjectURL(url);
      a.remove(); // Clean up the anchor element
    } catch (error) {
      console.error("Error exporting vocabulary:", error);
      alert("Failed to export vocabulary.");
    } finally {
      setIsExporting(false);
    }
  }, [knownWords]);

  // Import vocabulary from JSON
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const importedData = JSON.parse(content);

        if (!isValidVocabularyImport(importedData)) {
          throw new Error("Invalid file format. Expected an array of objects with hanzi, pinyin, and translation.");
        }

        // Use VocabularyEntry for DB operations
        const wordsToImport: VocabularyEntry[] = importedData.map(word => ({
          hanzi: word.hanzi,
          pinyin: word.pinyin,
          translation: word.translation
        }));

        // Replace existing vocabulary in DB and state
        await dbClearVocabulary();
        await dbBulkAddVocabulary(wordsToImport);
        setKnownWords(wordsToImport); // Update state with imported words (Word type)

        alert(`Successfully imported ${wordsToImport.length} words.`);
      } catch (error: any) {
        console.error("Error importing words:", error);
        alert(`Import failed: ${error.message || "Unknown error"}`);
      } finally {
        setIsImporting(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      alert("Failed to read the selected file.");
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  }, [setKnownWords]);

  // Delete a word from vocabulary
  const handleDeleteWord = useCallback(async (hanziToDelete: string) => {
    // Find the word in the original list to ensure we have the full object if needed
    const wordToDelete = knownWords.find(w => w.hanzi === hanziToDelete);
    if (!wordToDelete) return; // Should not happen if hanziToDelete comes from filteredWords

    // Optimistically update UI
    const updatedWords = knownWords.filter(w => w.hanzi !== hanziToDelete);
    setKnownWords(updatedWords);

    try {
      await dbDeleteWordFromVocabulary(hanziToDelete);
      // Success: DB updated, state is correct
    } catch (error) {
      console.error("Error deleting word:", error);
      // Revert UI state on failure
      setKnownWords(knownWords);
      alert(`Failed to delete word "${hanziToDelete}".`);
    }
  }, [knownWords, setKnownWords]);

  // Trigger file input click
  const triggerImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={styles.settingsPage}>
      <h2 className={styles.title}>Settings</h2>

      {/* Font Size Setting */}
      <div className={styles.settingItem}>
        <label htmlFor="fontSizeRange" className={styles.label}>Font Size</label>
        <div className={styles.fontSizeControl}>
          <input
            id="fontSizeRange"
            type="range"
            min={14}
            max={36}
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            aria-labelledby="fontSizeLabel"
          />
          <span className={styles.fontSizeValue}>{fontSize}px</span>
        </div>
      </div>

      {/* Import/Export Buttons */}
      <div className={`${styles.settingItem} ${styles.buttonGroup}`}>
        <h3 className={styles.label}>Vocabulary Data</h3>
        <button
          className={styles.exportButton}
          onClick={handleExport}
          disabled={isExporting || knownWords.length === 0}
        >
          {isExporting ? 'Exporting...' : 'Export Vocabulary'}
        </button>
        <button
          className={styles.importButton}
          onClick={triggerImportClick}
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Vocabulary'}
        </button>
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          className={styles.hiddenInput}
          onChange={handleImport}
          aria-hidden="true"
        />
      </div>

      {/* Manage Vocabulary Section */}
      <div className={styles.settingItem}>
        <h3 className={styles.subtitle}>Manage Vocabulary ({knownWords.length} words)</h3>
        <label htmlFor="vocabSearch" className={styles.label}>Search Vocabulary</label>
        <input
          id="vocabSearch"
          type="text"
          placeholder="Search by Hanzi, Pinyin, or Translation..."
          className={styles.searchBar}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {knownWords.length === 0 ? (
          <p>Your vocabulary list is empty.</p>
        ) : (
          <ul className={styles.vocabularyList} aria-live="polite"> {/* Announce changes for screen readers */}
            {filteredWords.length === 0 && searchQuery && (
              <li className={styles.noResultsItem}>No matching words found.</li>
            )}
            {filteredWords.map((word) => (
              <li key={word.hanzi} className={styles.vocabularyItem}>
                <span className={styles.vocabHanzi}>{word.hanzi}</span>
                <span className={styles.vocabPinyin}>{word.pinyin}</span>
                <span className={styles.vocabTranslation}>{word.translation}</span>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteWord(word.hanzi)}
                  aria-label={`Delete ${word.hanzi}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Settings;
