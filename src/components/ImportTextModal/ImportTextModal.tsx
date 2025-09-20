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
  
  // AI generation states
  const [aiTheme, setAiTheme] = useState('');
  const [aiLength, setAiLength] = useState('short');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiSection, setShowAiSection] = useState(false);

  const resetForm = useCallback(() => {
    setImportTitle('');
    setImportMandarin('');
    setImportPinyin('');
    setImportEnglish('');
    setImportError(null);
    setAiTheme('');
    setAiLength('short');
    setIsGenerating(false);
    setShowAiSection(false);
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

  const handleGenerateAiText = useCallback(async () => {
    if (!aiTheme.trim()) {
      setImportError('Please enter a theme for the AI to generate text about.');
      return;
    }

    // Check if Puter.js is available
    if (typeof window === 'undefined' || !window.puter) {
      setImportError('AI service is not available. Please refresh the page and try again.');
      return;
    }

    setIsGenerating(true);
    setImportError(null);

    try {
      const lengthMap = {
        'short': '5-8 words/phrases',
        'medium': '10-15 words/phrases',
        'long': '20-25 words/phrases'
      };

      const prompt = `Write a story in Chinese about "${aiTheme}" with ${lengthMap[aiLength as keyof typeof lengthMap]}. Format it exactly as follows:
      
Title: [A short title for the story]

Mandarin: [Chinese text with words separated by | (pipe character)]
Pinyin: [Pinyin with tone marks, words separated by | (pipe character)]  
English: [English translation, words separated by | (pipe character)]

Example format:
Title: My Daily Routine

Mandarin: 我|每天|早上|七点|起床|洗脸|刷牙|吃|早餐
Pinyin: wǒ|měitiān|zǎoshang|qīdiǎn|qǐchuáng|xǐliǎn|shuāyá|chī|zǎocān
English: I|every day|morning|seven o'clock|get up|wash face|brush teeth|eat|breakfast

Make sure each section has the same number of segments separated by pipes (|). The story should be about "${aiTheme}" and be appropriate for Chinese language learners.`;

      const response = await window.puter.ai.chat(prompt, { model: "gpt-4.1-nano" });
      
      let content = '';
      if (typeof response.message.content === 'string') {
        content = response.message.content;
      } else if (Array.isArray(response.message.content)) {
        content = response.message.content[0]?.text || '';
      }

      if (!content) {
        setImportError('AI returned empty response. Please try again.');
        return;
      }

      // Parse the AI response
      const lines = content.split('\n').filter(line => line.trim());
      let titleLine = '';
      let mandarinLine = '';
      let pinyinLine = '';
      let englishLine = '';

      for (const line of lines) {
        const cleanLine = line.trim();
        if (cleanLine.toLowerCase().startsWith('title:')) {
          titleLine = cleanLine.substring(6).trim();
        } else if (cleanLine.toLowerCase().startsWith('mandarin:')) {
          mandarinLine = cleanLine.substring(9).trim();
        } else if (cleanLine.toLowerCase().startsWith('pinyin:')) {
          pinyinLine = cleanLine.substring(7).trim();
        } else if (cleanLine.toLowerCase().startsWith('english:')) {
          englishLine = cleanLine.substring(8).trim();
        }
      }

      if (titleLine && mandarinLine && pinyinLine && englishLine) {
        // Validate that all sections have the same number of segments
        const mandarinCount = mandarinLine.split('|').length;
        const pinyinCount = pinyinLine.split('|').length;
        const englishCount = englishLine.split('|').length;

        if (mandarinCount !== pinyinCount || mandarinCount !== englishCount) {
          setImportError(`AI generated inconsistent segments. Mandarin: ${mandarinCount}, Pinyin: ${pinyinCount}, English: ${englishCount}. Please try again.`);
          return;
        }

        setImportTitle(titleLine);
        setImportMandarin(mandarinLine);
        setImportPinyin(pinyinLine);
        setImportEnglish(englishLine);
        setShowAiSection(false);
      } else {
        setImportError('Failed to parse AI response. Please try again or enter text manually.');
      }

    } catch (error) {
      console.error('Error generating AI text:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportError(`Failed to generate text with AI: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setIsGenerating(false);
    }
  }, [aiTheme, aiLength]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="importModalTitle">
        <h3 id="importModalTitle" className={styles.modalTitle}>Import New Text</h3>
        <p className={styles.modalInstructions}>Enter the text title, then paste the Mandarin, Pinyin, and English versions below, separating each word/phrase with a pipe character (|).</p>
        
        <div className={styles.aiSection}>
          <button
            type="button"
            onClick={() => setShowAiSection(!showAiSection)}
            className={styles.aiToggleButton}
            disabled={typeof window !== 'undefined' && !window.puter}
            title={typeof window !== 'undefined' && !window.puter ? 'AI service is not available' : ''}
          >
            {showAiSection ? '📝 Manual Entry' : '🤖 Generate with AI'}
          </button>
          
          {showAiSection && (
            <div className={styles.aiControls}>
              <div className={styles.importFormGroup}>
                <label htmlFor="aiTheme">Theme/Topic:</label>
                <input
                  id="aiTheme"
                  type="text"
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                  className={styles.importInput}
                  placeholder="e.g., daily routine, family, food, travel, school"
                  disabled={isGenerating}
                />
                <div className={styles.exampleThemes}>
                  <span>Quick examples: </span>
                  {['daily routine', 'family dinner', 'shopping', 'weather', 'hobbies'].map(theme => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setAiTheme(theme)}
                      className={styles.themeButton}
                      disabled={isGenerating}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.importFormGroup}>
                <label htmlFor="aiLength">Text Length:</label>
                <select
                  id="aiLength"
                  value={aiLength}
                  onChange={(e) => setAiLength(e.target.value)}
                  className={styles.importInput}
                  disabled={isGenerating}
                >
                  <option value="short">Short (5-8 words)</option>
                  <option value="medium">Medium (10-15 words)</option>
                  <option value="long">Long (20-25 words)</option>
                </select>
              </div>
              
              <button
                type="button"
                onClick={handleGenerateAiText}
                disabled={isGenerating || !aiTheme.trim()}
                className={styles.generateButton}
              >
                {isGenerating ? '🔄 Generating...' : '✨ Generate Story'}
              </button>
              
              {isGenerating && (
                <div className={styles.generatingText}>
                  Creating a story about "{aiTheme}"... This may take a few seconds.
                </div>
              )}
            </div>
          )}
        </div>

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
