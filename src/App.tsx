import React, { useState } from 'react';
import db from './database';
import './App.css';

interface Word {
  hanzi: string;
  pinyin: string;
  translation: string;
}

const App: React.FC = () => {
  const [text, setText] = useState<Word[]>([]);
  const [knownWords, setKnownWords] = useState<string[]>([]);

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const importedText: Word[] = JSON.parse(content);
        setText(importedText);
      };
      reader.readAsText(file);
    }
  };

  const markAsKnown = async (word: string) => {
    setKnownWords((prev) => [...prev, word]);
    await db.vocabulary.add({ word, pinyin: '', translation: '' });
  };

  return (
    <div className="app">
      <h1>Mandarin Reading App</h1>
      <input type="file" accept="application/json" onChange={handleImportJSON} />
      <div className="text-container">
        {text.map((word, index) => (
          <div key={index} className="word"
              onClick={() => markAsKnown(word.hanzi)}
          >
            <div className="pinyin">{word.pinyin}</div>
            <div 
              className="hanzi"
            >
              {word.hanzi}
            </div>
            {!knownWords.includes(word.hanzi) && (
              <div className="translation">
                {word.translation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
