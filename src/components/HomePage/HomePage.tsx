import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  getTexts as dbGetTexts,
  deleteText as dbDeleteText,
  TextEntry
} from '../../db/database';
import styles from './HomePage.module.css';
import { MdContentPaste } from "react-icons/md";
import { Word } from '../../types';

interface ParsedWord extends Word {}

const parseTextContent = (content: string): ParsedWord[] => {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed as ParsedWord[];
    }
    console.warn("Parsed content is not an array:", parsed);
    return [];
  } catch (error) {
    console.error("Failed to parse text content:", error, "Content:", content);
    return [];
  }
};

const promptText = `Write a story in mandarin and then output the story in this json format:
[
  {
    "hanzi": "我",
    "pinyin": "wǒ",
    "translation": "I"
  },
  {
    "hanzi": "喜欢",
    "pinyin": "xǐhuan",
    "translation": "like"
  },
  {
    "hanzi": "苹果",
    "pinyin": "píngguǒ",
    "translation": "apple"
  }
]`;

interface HomePageProps {
  onSelect: (text: TextEntry) => void;
  onImport: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelect, onImport }) => {
  const [texts, setTexts] = useState<TextEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTexts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTexts = await dbGetTexts();
      setTexts(fetchedTexts);
    } catch (err) {
      console.error("Failed to fetch texts:", err);
      setError("Failed to load texts. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTexts();
  }, [fetchTexts]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await dbDeleteText(id);
      setTexts((prevTexts) => prevTexts.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete text:", err);
      alert("Failed to delete text. Please check the console for details.");
    }
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen(prev => !prev);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      alert('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy prompt.');
    }
  }, []);

  const generatePreview = useMemo(() => (content: string): string => {
    const words = parseTextContent(content);
    return words.slice(0, 15).map(w => w.hanzi).join(' ');
  }, []);

  return (
    <div className={styles.homePage}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Imported Texts</h2>
        <button className={styles.importButton} onClick={onImport}>Import New Text</button>
      </div>

      {isLoading && <p>Loading texts...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!isLoading && !error && texts.length === 0 && (
        <p>No texts imported yet. Click "Import New Text" to add one.</p>
      )}

      {!isLoading && !error && texts.length > 0 && (
        <ul className={styles.textList}>
          {texts.map((t) => (
            <li key={t.id} className={styles.textItem}>
              <div className={styles.textInfo} onClick={() => onSelect(t)} role="button" tabIndex={0}>
                <div className={styles.textTitle}>{t.title}</div>
                <div className={styles.textPreview}>
                  {generatePreview(t.content)}
                </div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(t.id)}
                aria-label={`Delete text titled ${t.title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className={styles.floatingButton} onClick={toggleModal} aria-label="Show JSON format prompt">
        <MdContentPaste />
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={toggleModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <h3 id="modalTitle" className={styles.modalTitle}>Required JSON Format</h3>
            <pre className={styles.promptPre}>{promptText}</pre>
            <div className={styles.modalActions}>
              <button onClick={copyToClipboard} className={styles.copyButton}>Copy Format</button>
              <button onClick={toggleModal} className={styles.closeButton}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
