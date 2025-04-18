import React, { useState } from 'react';
import db from './database';
import styles from './Reader.module.css'; // Import CSS Module

interface Word {
  hanzi: string;
  pinyin: string;
  translation: string;
}

interface ReaderProps {
  text: { id: string; title: string; content: string };
  knownWords: string[];
  setKnownWords: (words: string[]) => void;
  onBack: () => void;
}

const Reader: React.FC<ReaderProps> = ({ text, knownWords, setKnownWords, onBack }) => {
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
    <div className={styles.readerContainer}>
      <button className={styles.backButton} onClick={onBack}>Back</button>
      <h2 className={styles.textTitle}>{text.title}</h2>
      <div className={styles.wordsWrapper}> 
        {words.map((word, idx) => (
          <div key={idx} className={styles.wordUnit}>
            <div className={styles.pinyin}>{word.pinyin}</div>
            <div
              className={styles.hanzi}
              onMouseEnter={() => setHoveredWord(word.hanzi)}
              onMouseLeave={() => setHoveredWord(null)}
              onClick={() => markAsKnown(word.hanzi)}
            >
              {word.hanzi}
            </div>
            {!knownWords.includes(word.hanzi) && (
              <div className={styles.translation}>
                {word.translation}
                {hoveredWord === word.hanzi && (
                  <button className={styles.markKnownButton} onClick={() => markAsKnown(word.hanzi)}>
                    Mark Known
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
