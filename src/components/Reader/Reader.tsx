import React, { useMemo, useCallback, useState } from 'react';
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

  // Export functionality state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

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

  // Get unknown words for export
  const unknownWords = useMemo(() => {
    return words.filter(word => !wordIsKnown(word));
  }, [words, wordIsKnown]);

  const generateAllPhrases = useCallback(async (words: Word[]): Promise<string[]> => {
    try {
      // Check if Puter.js is available
      if (typeof window === 'undefined' || !window.puter) {
        throw new Error('AI service not available');
      }

      const wordList = words.map(word => `- ${word.hanzi} (${word.pinyin} - ${word.translation})`).join('\n');

      const prompt = `Create simple, useful Chinese phrases using each of the following words. Each phrase should naturally use the given word and be practical for language learners.

Words to use:
${wordList}

Format your response exactly as:
1. [Chinese phrase using first word]|[Pinyin with tone marks]|[English translation]
2. [Chinese phrase using second word]|[Pinyin with tone marks]|[English translation]
3. [Chinese phrase using third word]|[Pinyin with tone marks]|[English translation]

Continue this pattern for all words. Each line should start with the number, followed by the phrase separated by | (pipe characters).`;

      const response = await window.puter.ai.chat(prompt, { model: "gpt-4o" });
      
      let content = '';
      if (typeof response.message.content === 'string') {
        content = response.message.content;
      } else if (Array.isArray(response.message.content)) {
        content = response.message.content[0]?.text || '';
      }

      if (!content) {
        throw new Error('Empty response from AI');
      }

      // Parse the response
      const lines = content.split('\n').filter(line => line.trim());
      const phrases: string[] = [];

      for (const line of lines) {
        const cleanLine = line.trim();
        // Match lines that start with a number followed by a dot
        const match = cleanLine.match(/^\d+\.\s*(.+)$/);
        if (match) {
          phrases.push(match[1]);
        }
      }

      // If we didn't get enough phrases, fill with fallbacks
      while (phrases.length < words.length) {
        const word = words[phrases.length];
        phrases.push(`${word.hanzi}很有用|${word.pinyin} hěn yǒuyòng|${word.translation} is very useful`);
      }

      return phrases.slice(0, words.length);

    } catch (error) {
      console.error('Error generating phrases:', error);
      // Fallback: create simple phrases for all words
      return words.map(word => `${word.hanzi}很有用|${word.pinyin} hěn yǒuyòng|${word.translation} is very useful`);
    }
  }, []);

  // CSV utility function
  const escapeCSV = useCallback((value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }, []);

  const exportUnknownWords = useCallback(async () => {
    if (unknownWords.length === 0) {
      setExportError('No unknown words to export.');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportProgress({ current: 0, total: 1 });

    try {
      // CSV header - only phrases now
      const csvRows = [''];

      // Generate all phrases in one request
      setExportProgress({ current: 1, total: 1 });
      const phrases = await generateAllPhrases(unknownWords);

      // Add each phrase to CSV
      for (const phrase of phrases) {
        const [phraseHanzi, phrasePinyin, phraseEnglish] = phrase.split('|');
        
        const csvRow = [
          escapeCSV(phraseHanzi || 'N/A'),
          escapeCSV(phrasePinyin || 'N/A'),
          escapeCSV(phraseEnglish || 'N/A')
        ].join(';');

        csvRows.push(csvRow);
      }

      // Create and download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${text.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_flashcards.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('CSV download not supported in this browser');
      }

    } catch (error) {
      console.error('Export error:', error);
      setExportError('Failed to export flashcards. Please check your browser compatibility and try again.');
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  }, [unknownWords, text.title, generateAllPhrases, escapeCSV]);

  return (
    <div className={styles.readerContainer}>
      <div className={styles.readerHeader}>
        <h1 className={styles.textTitle}>{text.title}</h1>
        <div className={styles.readerControls}>
          <button
            onClick={exportUnknownWords}
            disabled={isExporting || unknownWords.length === 0}
            className={styles.exportButton}
            title={unknownWords.length === 0 ? 'No unknown words to export' : `Export ${unknownWords.length} unknown words as flashcards`}
          >
            {isExporting 
              ? `🔄 Generating Phrases...` 
              : `📄 Export Flashcards (${unknownWords.length})`
            }
          </button>
        </div>
      </div>
      
      {exportError && (
        <div className={styles.exportError}>
          {exportError}
        </div>
      )}
      
      {isExporting && exportProgress.total > 0 && (
        <div className={styles.exportProgress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
            ></div>
          </div>
          <div className={styles.progressText}>
            Generating phrases for {unknownWords.length} words...
          </div>
        </div>
      )}
      
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
