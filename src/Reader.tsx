import React from 'react';
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
      <div className="grid gap-2 background-red-100"> 
        {words.map((word, idx) => (
          <div key={idx}>
            <div className="text-xs text-gray-500">{word.pinyin}</div>
            <div
              className="hanzi cursor-pointer background-red-100"
              onClick={() => markAsKnown(word.hanzi)}
            >
              {word.hanzi}
            </div>
            {!knownWords.includes(word.hanzi) && (
              <div className="text-xs text-blue-600">
                {word.translation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reader;
