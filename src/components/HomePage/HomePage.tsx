import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  getTexts as dbGetTexts,
  deleteText as dbDeleteText,
  addText as dbAddText,
  TextEntry
} from '../../db/database';
import styles from './HomePage.module.css';
import { Word } from '../../types';
import { v4 as uuidv4 } from 'uuid';

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
interface HomePageProps {
  onSelect: (text: TextEntry) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelect }) => {
  const [texts, setTexts] = useState<TextEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [importTitle, setImportTitle] = useState('');
  const [importMandarin, setImportMandarin] = useState('');
  const [importPinyin, setImportPinyin] = useState('');
  const [importEnglish, setImportEnglish] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

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
    if (!isImportModalOpen) {
      setImportTitle('');
      setImportMandarin('');
      setImportPinyin('');
      setImportEnglish('');
      setImportError(null);
    }
  }, [isImportModalOpen]);

  const handleImportSubmit = useCallback(async () => {
    setImportError(null);

    if (!importTitle.trim()) {
      setImportError('Title cannot be empty.');
      return;
    }
    if (!importMandarin.trim() || !importPinyin.trim() || !importEnglish.trim()) {
      setImportError('Mandarin, Pinyin, and English fields cannot be empty.');
      return;
    }

    const mandarinSegments = importMandarin.split('|').map(s => s.trim()).filter(Boolean);
    const pinyinSegments = importPinyin.split('|').map(s => s.trim()).filter(Boolean);
    const englishSegments = importEnglish.split('|').map(s => s.trim()).filter(Boolean);

    if (mandarinSegments.length !== pinyinSegments.length || mandarinSegments.length !== englishSegments.length) {
      setImportError(`Segment counts do not match after splitting by '|'. Mandarin: ${mandarinSegments.length}, Pinyin: ${pinyinSegments.length}, English: ${englishSegments.length}`);
      return;
    }

    if (mandarinSegments.length === 0) {
      setImportError('No valid segments found. Ensure you use "|" to separate words.');
      return;
    }

    const words: Word[] = mandarinSegments.map((hanzi, index) => ({
      hanzi,
      pinyin: pinyinSegments[index],
      translation: englishSegments[index],
    }));

    const newText: TextEntry = {
      id: uuidv4(),
      title: importTitle.trim(),
      content: JSON.stringify(words, null, 2),
    };

    try {
      await dbAddText(newText);
      await fetchTexts();
      toggleImportModal();
    } catch (err) {
      console.error("Failed to save new text:", err);
      setImportError("Failed to save the text. Please check the console for details.");
    }
  }, [importTitle, importMandarin, importPinyin, importEnglish, fetchTexts, toggleImportModal]);

  const generatePreview = useMemo(() => (content: string): string => {
    const words = parseTextContent(content);
    return words.slice(0, 15).map(w => w.hanzi).join(' ');
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

      {isImportModalOpen && (
        <div className={styles.modalOverlay} onClick={toggleImportModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="importModalTitle">
            <h3 id="importModalTitle" className={styles.modalTitle}>Import New Text</h3>
            <p className={styles.modalInstructions}>Enter the text title, then paste the Mandarin, Pinyin, and English versions below, separating each word/phrase with a pipe character (|).</p>

            <div className={styles.importFormGroup}>
              <label htmlFor="importTitle">Title:</label>
              <input
                id="importTitle"
                type="text"
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
                className={styles.importInput}
              />
            </div>

            <div className={styles.importFormGroup}>
              <label htmlFor="importMandarin">Mandarin:</label>
              <textarea
                id="importMandarin"
                value={importMandarin}
                onChange={(e) => setImportMandarin(e.target.value)}
                className={styles.importTextarea}
                rows={4}
                placeholder="例如：我|喜欢|学|中文"
              />
            </div>

            <div className={styles.importFormGroup}>
              <label htmlFor="importPinyin">Pinyin:</label>
              <textarea
                id="importPinyin"
                value={importPinyin}
                onChange={(e) => setImportPinyin(e.target.value)}
                className={styles.importTextarea}
                rows={4}
                placeholder="e.g., wǒ|xǐhuān|xué|zhōngwén"
              />
            </div>

            <div className={styles.importFormGroup}>
              <label htmlFor="importEnglish">English:</label>
              <textarea
                id="importEnglish"
                value={importEnglish}
                onChange={(e) => setImportEnglish(e.target.value)}
                className={styles.importTextarea}
                rows={4}
                placeholder="e.g., I|like|study|Chinese"
              />
            </div>

            {importError && <p className={styles.errorTextModal}>{importError}</p>}

            <div className={styles.modalActions}>
              <button onClick={handleImportSubmit} className={styles.submitButton}>Import Text</button>
              <button onClick={toggleImportModal} className={styles.closeButton}>Cancel</button>
            </div>
            <p>Prompt: Write a text in Mandarin, Pinyin and English separating the words with a pipe (|). Example: 我|喜欢|学|中文</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
