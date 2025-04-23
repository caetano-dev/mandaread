import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  getTexts as dbGetTexts,
  deleteText as dbDeleteText,
  TextEntry
} from '../../db/database';
import styles from './HomePage.module.css';
import ImportTextModal from '../ImportTextModal/ImportTextModal';

interface ParsedWord {
  hanzi: string;
  pinyin: string;
  translation: string;
}

interface HomePageProps {
  onSelect: (text: TextEntry) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelect }) => {
  const [texts, setTexts] = useState<TextEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const toggleImportModal = useCallback(() => {
    setIsImportModalOpen(prev => !prev);
  }, []);

  const handleImportSuccess = useCallback(() => {
    fetchTexts();
  }, [fetchTexts]);

  const generatePreview = useMemo(() => (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 15).map((w: ParsedWord) => w.hanzi).join(' ');
      }
      console.warn("Parsed content is not an array:", parsed);
      return '';
    } catch (error) {
      console.error("Failed to parse text content:", error, "Content:", content);
      return '';
    }
  }, []);

  return (
    <div className={styles.homePage}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Imported Texts</h2>
        <button className={styles.importButton} onClick={toggleImportModal}>Import New Text</button>
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

      <ImportTextModal
        isOpen={isImportModalOpen}
        onClose={toggleImportModal}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default HomePage;
