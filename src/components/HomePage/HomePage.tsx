import React, { useEffect, useState } from 'react';
import db from '../../db/database';
import styles from './HomePage.module.css';
import { MdContentPaste } from "react-icons/md";

const prompt = `Write a story in mandarin and then output the story in this json format:
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

interface TextPreview {
  id: string;
  title: string;
  content: string;
}

interface HomePageProps {
  onSelect: (text: TextPreview) => void;
  onImport: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelect, onImport }) => {
  const [texts, setTexts] = useState<TextPreview[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    db.texts.toArray().then(setTexts);
  }, []);

  const handleDelete = async (id: string) => {
    await db.texts.delete(id);
    setTexts(await db.texts.toArray());
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('hello world');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={styles.homePage}>
      <h2 className={styles.title}>Your Imported Texts</h2>
      <button className={styles.importButton} onClick={onImport}>Import New Text</button>
      <ul className={styles.textList}>
        {texts.map((t) => (
          <li key={t.id} className={styles.textItem}>
            <div className={styles.textInfo} onClick={() => onSelect(t)}>
              <div className={styles.textTitle}>{t.title}</div>
              <div className={styles.textPreview}>
                {JSON.parse(t.content).slice(0, 15).map((w: any) => w.hanzi).join(' ')}
              </div>
            </div>
            <button className={styles.deleteButton} onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <button className={styles.floatingButton} onClick={toggleModal}>
        <MdContentPaste />
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={toggleModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p>{prompt}</p>
            <button onClick={copyToClipboard} className={styles.copyButton}>Copy</button>
            <button onClick={toggleModal} className={styles.closeButton}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
