import React, { useState, useRef } from 'react'; // Added useState
import db from '../../db/database';
import styles from './Settings.module.css';
import { Word } from '../../types/index';

interface SettingsProps {
  knownWords: Word[];
  setKnownWords: (words: Word[]) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ knownWords, setKnownWords, fontSize, setFontSize }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  const handleExport = () => {
    const data = JSON.stringify(knownWords, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        try {
          const words: Word[] = JSON.parse(content);
          setKnownWords(words);
          await db.vocabulary.clear();
          await db.vocabulary.bulkAdd(words.map(word => ({hanzi: word.hanzi, pinyin: word.pinyin, translation: word.translation })));
        } catch (error) {
          console.error("Error importing words:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteWord = (index: number) => {
    // Find the actual word object based on the filtered list index
    const wordToDelete = filteredWords[index];
    const originalIndex = knownWords.findIndex(w => w.hanzi === wordToDelete.hanzi);

    if (originalIndex !== -1) {
      const updatedWords = knownWords.filter((_, i) => i !== originalIndex);
      setKnownWords(updatedWords);
      db.vocabulary.delete(knownWords[originalIndex].hanzi);
    }
  };

  // Filter words based on search query
  const filteredWords = knownWords.filter(word =>
    word.hanzi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.settingsPage}>
      <h2 className={styles.title}>Settings</h2>
      <div className={styles.settingItem}>
        <label className={styles.label}>Font Size</label>
        <input type="range" min={14} max={36} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
        <span className={styles.fontSizeValue}>{fontSize}px</span>
      </div>
      <div className={`${styles.settingItem} ${styles.buttonGroup}`}>
        <button className={styles.exportButton} onClick={handleExport}>Export Vocabulary</button>
        <button className={styles.importButton} onClick={() => fileInputRef.current?.click()}>Import Vocabulary</button>
        <input type="file" accept="application/json" ref={fileInputRef} className={styles.hiddenInput} onChange={handleImport} />
      </div>
      <div className={styles.settingItem}>
        <h3 className={styles.subtitle}>Manage Vocabulary</h3>
        {/* Add Search Bar */}
        <input
          type="text"
          placeholder="Search vocabulary..."
          className={styles.searchBar}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ul className={styles.vocabularyList}>
          {/* Map over filteredWords instead of knownWords */}
          {filteredWords.map((word, index) => (
            <li key={word.hanzi} className={styles.vocabularyItem}> {/* Use word.hanzi as key for stability */}
              <span>{word.hanzi}</span>
              <span>{word.pinyin}</span>
              <span>{word.translation}</span>
              {/* Pass the index from the filtered list */}
              <button className={styles.deleteButton} onClick={() => handleDeleteWord(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;
