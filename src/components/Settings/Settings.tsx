import React, { useRef } from 'react';
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
          await db.vocabulary.bulkAdd(words.map(word => ({id: word.id, hanzi: word.hanzi, pinyin: word.pinyin, translation: word.translation })));
        } catch (error) {
          console.error("Error importing words:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteWord = (index: number) => {
    const updatedWords = knownWords.filter((_, i) => i !== index);
    setKnownWords(updatedWords);
//    db.vocabulary.delete(knownWords[index].hanzi);
    db.vocabulary.delete(knownWords[index].hanzi);
    db.vocabulary.delete(knownWords[index].pinyin);
    db.vocabulary.delete(knownWords[index].translation);
    db.vocabulary.delete(knownWords[index].id);
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
              <span>{word.hanzi}</span>
              <span>{word.pinyin}</span>
              <span>{word.translation}</span>
              <button className={styles.deleteButton} onClick={() => handleDeleteWord(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;
