import React, { useRef } from 'react';
import db from './database';

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

// example of exported vocabulary:  [ "今天", "很", "大", "我" ]
//manageVocabulary is a function that will be used to manage the vocabulary. It lets the user see the vocabulary, add new words, delete words, and edit words.
  const handleDeleteWord = (index: number) => {
    const newWords = [...knownWords];
    newWords.splice(index, 1);
    setKnownWords(newWords);
    db.vocabulary.delete(newWords[index]);
}

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="mb-4">
        <label className="block mb-2">Font Size</label>
        <input type="range" min={14} max={36} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
        <span className="ml-2">{fontSize}px</span>
      </div>
      <div className="mb-4">
        <button className="px-4 py-2 bg-green-500 text-white rounded mr-2" onClick={handleExport}>Export Vocabulary</button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => fileInputRef.current?.click()}>Import Vocabulary</button>
        <input type="file" accept="application/json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Manage Vocabulary</h3>
        <ul>
          {knownWords.map((word, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{word}</span>
              <button className="text-red-500" onClick={() => handleDeleteWord(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;
