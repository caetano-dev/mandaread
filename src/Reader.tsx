import React, { useState } from 'react';
import db from './database';

interface Word {
  hanzi: string;
  pinyin: string;
  translation: string;
}

interface ReaderProps {
  text: { id: string; title: string; content: string };
  knownWords: string[];
  setKnownWords: (words: string[]) => void;
  fontSize: number;
  onBack: () => void;
}

const Reader: React.FC<ReaderProps> = ({ text, knownWords, setKnownWords, fontSize, onBack }) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const words: Word[] = JSON.parse(text.content);

  const markAsKnown = async (word: string) => {
    if (!knownWords.includes(word)) {
      const newWords = [...knownWords, word];
      setKnownWords(newWords);
      await db.vocabulary.add({ word, pinyin: '', translation: '' });
    }
  };

  return (
    <div className="p-4" style={{ fontSize }}>
      <button className="mb-4 px-4 py-2 bg-gray-300 rounded" onClick={onBack}>Back</button>
      <h2 className="text-xl font-bold mb-4">{text.title}</h2>
      <div className="flex flex-wrap gap-2">
        {words.map((word, idx) => (
          <div key={idx} className="flex flex-col items-center m-1">
            <div className="text-xs text-gray-500">{word.pinyin}</div>
            <div
              className="hanzi cursor-pointer px-1"
              onMouseEnter={() => setHoveredWord(word.hanzi)}
              onMouseLeave={() => setHoveredWord(null)}
              onClick={() => markAsKnown(word.hanzi)}
            >
              {word.hanzi}
            </div>
            {!knownWords.includes(word.hanzi) && (
              <div className="text-xs text-blue-600">
                {word.translation}
                {hoveredWord === word.hanzi && (
                  <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded" onClick={() => markAsKnown(word.hanzi)}>
                    Mark as Known
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reader;
