import React, { useEffect, useState } from 'react';
import db from './database';

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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Imported Texts</h2>
      <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onImport}>Import New Text</button>
      <ul>
        {texts.map((t) => (
          <li key={t.id} className="mb-4 border p-2 rounded flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1 cursor-pointer" onClick={() => onSelect(t)}>
              <div className="font-semibold">{t.title}</div>
              <div className="text-gray-600 text-sm truncate">
                {JSON.parse(t.content).slice(0, 15).map((w: any) => w.hanzi).join(' ')}
              </div>
            </div>
            <button className="ml-4 px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
