import React from 'react';
import db from './database';
import styles from './Reader.module.css';

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
              onClick={() => markAsKnown(word.hanzi)}
            >
              {word.hanzi}
            </div>
            {!knownWords.includes(word.hanzi) && (
              <div className={styles.translation}>
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
