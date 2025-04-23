import React, { useState, useCallback } from 'react';
import { addText as dbAddText, TextEntry } from '../../db/database';
import { Word } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import styles from './ImportTextModal.module.css';

interface ImportTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const ImportTextModal: React.FC<ImportTextModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [importTitle, setImportTitle] = useState('');
  const [importMandarin, setImportMandarin] = useState('');
  const [importPinyin, setImportPinyin] = useState('');
  const [importEnglish, setImportEnglish] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setImportTitle('');
    setImportMandarin('');
    setImportPinyin('');
    setImportEnglish('');
    setImportError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

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
      onImportSuccess(); // Notify parent about success
      handleClose(); // Close modal after successful import
    } catch (err) {
      console.error("Failed to save new text:", err);
      setImportError("Failed to save the text. Please check the console for details.");
    }
  }, [importTitle, importMandarin, importPinyin, importEnglish, onImportSuccess, handleClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
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
          <button onClick={handleClose} className={styles.closeButton}>Cancel</button>
        </div>
        <p>Prompt: Write a text in Mandarin, Pinyin and English separating the words with a pipe (|). Example: 我|喜欢|学|中文</p>
      </div>
    </div>
  );
};

export default ImportTextModal;
