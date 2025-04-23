import React, { useMemo, useCallback } from 'react';
import {
  addWordToVocabulary as dbAddWordToVocabulary,
  TextEntry,
  VocabularyEntry
} from '../../db/database';
import styles from './Reader.module.css';
import { Word } from '../../types/index';

// Helper function to safely parse JSON content
const parseTextContent = (content: string): Word[] => {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      // Add basic validation for word structure if needed
      return parsed as Word[];
    }
    console.warn("Parsed text content is not an array:", parsed);
    return [];
  } catch (error) {
    console.error("Failed to parse text content:", error, "Content:", content);
    return [];
  }
};

interface ReaderProps {
  text: TextEntry;
  knownWords: Word[]; // Keep using Word type for props consistency
  setKnownWords: (words: Word[]) => void;
}

const Reader: React.FC<ReaderProps> = ({ text, knownWords, setKnownWords }) => {
  // Memoize parsed words to avoid re-parsing on every render
  const words = useMemo(() => parseTextContent(text.content), [text.content]);

  // Use a Set for efficient known word lookup
  const knownWordsSet = useMemo(() => new Set(knownWords.map(w => w.hanzi)), [knownWords]);

  const wordIsKnown = useCallback((word: Word) => {
    return knownWordsSet.has(word.hanzi);
  }, [knownWordsSet]);

  const markAsKnown = useCallback(async (word: Word) => {
    if (wordIsKnown(word)) return; // Already known, do nothing

    const newKnownWord: VocabularyEntry = { hanzi: word.hanzi, pinyin: word.pinyin, translation: word.translation };

    // Optimistically update UI state
    const updatedKnownWords = [...knownWords, newKnownWord];
    setKnownWords(updatedKnownWords);

    try {
      await dbAddWordToVocabulary(newKnownWord);
      // Success: DB updated, state is already correct
    } catch (error) {
      console.error("Failed to add word to vocabulary:", error);
      // Revert UI state on failure
      setKnownWords(knownWords);
      alert(`Failed to mark "${word.hanzi}" as known. Please try again.`);
    }
  }, [knownWords, setKnownWords, wordIsKnown]); // Include wordIsKnown dependency

  return (
    <div className={styles.readerContainer}>
      <h1 className={styles.textTitle}>{text.title}</h1>
      <div className={styles.wordsWrapper}>
        {words.map((word, idx) => {
          const isKnown = wordIsKnown(word);
          return (
            <div key={`${word.hanzi}-${idx}`} className={styles.wordUnit}> {/* More robust key */}
              <div className={styles.pinyin}>{word.pinyin}</div>
              <div
                className={`${styles.hanzi} ${isKnown ? styles.hanziKnown : styles.hanziUnknown}`}
                onClick={() => !isKnown && markAsKnown(word)}
                role={isKnown ? undefined : "button"} // Add role="button" for clickable unknown words
                tabIndex={isKnown ? undefined : 0} // Make clickable unknown words focusable
                aria-label={isKnown ? word.hanzi : `Mark ${word.hanzi} as known`}
              >
                {word.hanzi}
              </div>
              {!isKnown && (
                <div className={styles.translation} aria-hidden="true"> {/* Hide decorative translation from screen readers */}
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
