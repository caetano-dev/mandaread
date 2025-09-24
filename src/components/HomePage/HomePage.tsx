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

 // Flashcard creation states
  const [flashcardTheme, setFlashcardTheme] = useState('');
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);

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

  // CSV utility function
  const escapeCSV = useCallback((value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }, []);

  const generateFlashcards = useCallback(async () => {
    if (!flashcardTheme.trim()) {
      setFlashcardError('Please enter a theme for flashcard generation.');
      return;
    }

    // Check if Puter.js is available
    if (typeof window === 'undefined' || !window.puter) {
      setFlashcardError('AI service is not available. Please refresh the page and try again.');
      return;
    }

    setIsGeneratingFlashcards(true);
    setFlashcardError(null);

    try {
      const prompt = `Create ${flashcardCount} simple, useful full Chinese phrases about "${flashcardTheme}". Each phrase should be practical for language learners studying Chinese.

Format your response exactly as:
1. [Chinese phrase]|[Pinyin with tone marks]|[English translation]
2. [Chinese phrase]|[Pinyin with tone marks]|[English translation]
3. [Chinese phrase]|[Pinyin with tone marks]|[English translation]

Continue this pattern for all ${flashcardCount} phrases. Each line should start with the number, followed by the phrase separated by | (pipe characters). Make sure the phrases are diverse, usefull and cover different aspects of "${flashcardTheme}".`;

      const response = await window.puter.ai.chat(prompt, { model: "gpt-4o" });
      
      let content = '';
      if (typeof response.message.content === 'string') {
        content = response.message.content;
      } else if (Array.isArray(response.message.content)) {
        content = response.message.content[0]?.text || '';
      }

      if (!content) {
        setFlashcardError('AI returned empty response. Please try again.');
        return;
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

      if (phrases.length === 0) {
        setFlashcardError('Failed to parse AI response. Please try again.');
        return;
      }

      // Create CSV content
      const csvRows = ['Phrase_Hanzi,Phrase_Pinyin,Phrase_English'];
      
      for (const phrase of phrases) {
        const [phraseHanzi, phrasePinyin, phraseEnglish] = phrase.split('|');
        
        if (phraseHanzi && phrasePinyin && phraseEnglish) {
          const csvRow = [
            escapeCSV(phraseHanzi.trim()),
            escapeCSV(phrasePinyin.trim()),
            escapeCSV(phraseEnglish.trim())
          ].join(';');
          csvRows.push(csvRow);
        }
      }

      // Download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const filename = `${flashcardTheme.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_flashcards.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Reset form
        setFlashcardTheme('');
        setFlashcardCount(10);
      } else {
        setFlashcardError('CSV download not supported in this browser.');
      }

    } catch (error) {
      console.error('Flashcard generation error:', error);
      setFlashcardError('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  }, [flashcardTheme, flashcardCount, escapeCSV]);

  return (
    <div className={styles.homePage}>
      {/* Flashcard Creation Section */}
      <div className={styles.flashcardSection}>
        <h2 className={styles.sectionTitle}>🎯 Create Flashcards</h2>
        <p className={styles.sectionDescription}>Generate Chinese flashcards on any topic using AI</p>
        
        <div className={styles.flashcardControls}>
          <div className={styles.controlGroup}>
            <label htmlFor="flashcardTheme" className={styles.controlLabel}>Theme/Topic:</label>
            <input
              id="flashcardTheme"
              type="text"
              value={flashcardTheme}
              onChange={(e) => setFlashcardTheme(e.target.value)}
              className={styles.themeInput}
              placeholder="e.g., restaurant, travel, business, family"
              disabled={isGeneratingFlashcards}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label htmlFor="flashcardCount" className={styles.controlLabel}>Number of Flashcards:</label>
            <select
              id="flashcardCount"
              value={flashcardCount}
              onChange={(e) => setFlashcardCount(Number(e.target.value))}
              className={styles.countSelect}
              disabled={isGeneratingFlashcards}
            >
              <option value={5}>5 flashcards</option>
              <option value={10}>10 flashcards</option>
              <option value={15}>15 flashcards</option>
              <option value={20}>20 flashcards</option>
              <option value={25}>25 flashcards</option>
            </select>
          </div>

          <button
            onClick={generateFlashcards}
            disabled={isGeneratingFlashcards || !flashcardTheme.trim()}
            className={styles.generateFlashcardsButton}
          >
            {isGeneratingFlashcards ? '🔄 Generating...' : '✨ Generate Flashcards'}
          </button>
        </div>

        <div className={styles.quickThemes}>
          <span className={styles.quickThemesLabel}>Quick themes: </span>
          {['restaurant', 'travel', 'business', 'family', 'shopping', 'weather'].map(theme => (
            <button
              key={theme}
              type="button"
              onClick={() => setFlashcardTheme(theme)}
              className={styles.quickThemeButton}
              disabled={isGeneratingFlashcards}
            >
              {theme}
            </button>
          ))}
        </div>

        {flashcardError && (
          <div className={styles.flashcardError}>
            {flashcardError}
          </div>
        )}
      </div>

      {/* Existing Text Import Section */}
      <div className={styles.textSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>📚 Your Imported Texts</h2>
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
      </div>

      <ImportTextModal
        isOpen={isImportModalOpen}
        onClose={toggleImportModal}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default HomePage;
