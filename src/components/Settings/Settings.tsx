import React, { useRef } from 'react';
import db from '../../db/database';
import styles from './Settings.module.css'; // Import CSS Module

interface SettingsProps {
  knownWords: string[];
  setKnownWords: (words: string[]) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ knownWords, setKnownWords, fontSize, setFontSize }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          const words: string[] = JSON.parse(content);
          setKnownWords(words);
          await db.vocabulary.clear();
          await db.vocabulary.bulkAdd(words.map(word => ({ word, pinyin: '', translation: '' })));
        } catch {}
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteWord = (index: number) => {
    const newWords = [...knownWords];
    newWords.splice(index, 1);
    setKnownWords(newWords);
    db.vocabulary.delete(newWords[index]);
  };

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
        <ul className={styles.vocabularyList}>
          {knownWords.map((word, index) => (
            <li key={index} className={styles.vocabularyItem}>
              <span>{word}</span>
              <button className={styles.deleteButton} onClick={() => handleDeleteWord(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;
