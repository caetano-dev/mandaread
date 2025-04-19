import React from 'react';
import db from '../../db/database';
import styles from './Reader.module.css';
import { Word } from '../../types/index';
interface ReaderProps {
  text: { id: string; title: string; content: string };
  knownWords: Word[];
  setKnownWords: (words: Word[]) => void;
  onBack: () => void;
}

const Reader: React.FC<ReaderProps> = ({ text, knownWords, setKnownWords, onBack }) => {
  const words: Word[] = JSON.parse(text.content);
  const wordIsKnown = (word: Word) => knownWords.some(knownWord => knownWord.hanzi === word.hanzi)

  const markAsKnown = async (word: Word) => {
    if (!wordIsKnown(word)) {
      const newWords = [...knownWords, word];
      setKnownWords(newWords);
      await db.vocabulary.add({ hanzi: word.hanzi, pinyin: word.pinyin, translation: word.translation });
    }
  };

  return (
    <div className={styles.readerContainer}>
      <button className={styles.backButton} onClick={onBack}>Back</button>
      <p>Click on the hanzi you already know to add them to your personal vocabulary.</p>
      <h2 className={styles.textTitle}>{text.title}</h2>
      <div className={styles.wordsWrapper}> 
        {words.map((word, idx) => (
          <div key={idx} className={styles.wordUnit}>
            <div className={styles.pinyin}>{word.pinyin}</div>
            <div
              className={styles.hanzi}
              onClick={() => markAsKnown(word)}
            >
              {word.hanzi}
            </div>
          {!wordIsKnown(word) && (
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
