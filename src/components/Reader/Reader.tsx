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
  const wordIsKnown = (word: Word) => knownWords.some(knownWord => knownWord.hanzi === word.hanzi);

  const markAsKnown = async (word: Word) => {
    if (!wordIsKnown(word)) {
      const newWords = [...knownWords, word];
      setKnownWords(newWords);
      try {
        await db.vocabulary.add({ hanzi: word.hanzi, pinyin: word.pinyin, translation: word.translation });
      } catch (error) {
        console.error("Failed to add word to vocabulary:", error);
        setKnownWords(knownWords);
      }
    }
  };

  return (
    <div className={styles.readerContainer}>
      <button className={styles.backButton} onClick={onBack}>Back</button>
      <h1 className={styles.textTitle}>{text.title}</h1>
      <div className={styles.wordsWrapper}> 
        {words.map((word, idx) => {
          const isKnown = wordIsKnown(word);
          return (
            <div key={idx} className={styles.wordUnit}>
              <div className={styles.pinyin}>{word.pinyin}</div>
              <div
                className={`${styles.hanzi} ${isKnown ? styles.hanziKnown : styles.hanziUnknown}`}
                onClick={() => !isKnown && markAsKnown(word)}
              >
                {word.hanzi}
              </div>
              {!isKnown && (
                <div className={styles.translation}>
                  {word.translation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reader;
