import React, { useEffect, useState } from 'react';
import db from './database';
import styles from './HomePage.module.css';

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

  useEffect(() => {
    db.texts.toArray().then(setTexts);
  }, []);

  const handleDelete = async (id: string) => {
    await db.texts.delete(id);
    setTexts(await db.texts.toArray());
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
    </div>
  );
};

export default HomePage;
