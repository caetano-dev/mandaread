import React, { useState, useEffect } from 'react';
import db from './db/database';
import HomePage from './components/HomePage/HomePage';
import Settings from './components/Settings/Settings';
import Reader from './components/Reader/Reader';
import { v4 as uuidv4 } from 'uuid';
import { Word } from './types/index';
import styles from './App.module.css'; 

const App: React.FC = () => {
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [page, setPage] = useState<'home' | 'reader' | 'settings'>('home');
  const [selectedText, setSelectedText] = useState<any>(null);
  const [fontSize, setFontSize] = useState<number>(20);

  useEffect(() => {
    db.vocabulary.toArray().then(words => setKnownWords(words.map(w => ({ id: w.id, hanzi: w.hanzi, pinyin: w.pinyin, translation: w.translation }))));
    db.settings.get('fontSize').then(s => s && setFontSize(s.value));
  }, []);

  useEffect(() => {
    db.settings.put({ key: 'fontSize', value: fontSize });
  }, [fontSize]);

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const title = prompt('Enter a title for this text:') || 'Untitled';
        const id = uuidv4();
        await db.texts.add({ id, title, content });
        setPage('home');
      };
      reader.readAsText(file);
    }
  };

  const handleSelectText = (text: any) => {
    setSelectedText(text);
    setPage('reader');
  };

  const handleBack = () => {
    setSelectedText(null);
    setPage('home');
  };

  return (
    <div className={styles.app} style={{ fontSize: `${fontSize}px` }}>
      <nav className={styles.nav}>
        <h1>Mandaread</h1>
        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('settings')}>Settings</button>
      </nav>
      {page === 'home' && (
        <HomePage onSelect={handleSelectText} onImport={() => document.getElementById('import-input')?.click()} />
      )}
      {page === 'reader' && selectedText && (
        <Reader
          text={selectedText}
          knownWords={knownWords}
          setKnownWords={setKnownWords}
          onBack={handleBack}
        />
      )}
      {page === 'settings' && (
        <Settings knownWords={knownWords} setKnownWords={setKnownWords} fontSize={fontSize} setFontSize={setFontSize} />
      )}
      <input id="import-input" type="file" accept="application/json" className={styles.hiddenInput} onChange={handleImportJSON} />
    </div>
  );
};

export default App;
