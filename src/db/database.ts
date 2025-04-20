import Dexie, { Table } from 'dexie'; // Re-add Dexie import
import { Word } from '../types'; // Keep Word import

// Define interfaces for table data
export interface VocabularyEntry extends Word {} // Use Word type directly

export interface TextEntry {
  id: string;
  title: string;
  content: string; // Keep as string, parsing happens elsewhere
}

export interface SettingEntry {
  key: string;
  value: any;
}

// Define the database schema
class MandarinDatabase extends Dexie {
  vocabulary: Table<VocabularyEntry, string>; // Primary key is string (hanzi)
  texts: Table<TextEntry, string>; // Primary key is string (id)
  settings: Table<SettingEntry, string>; // Primary key is string (key)

  constructor() {
    super('MandarinDatabase');
    this.version(2).stores({
      vocabulary: 'hanzi', // Primary key is the hanzi
      texts: 'id', // Primary key is the id
      settings: 'key', // Primary key is the key
    });

    this.vocabulary = this.table('vocabulary');
    this.texts = this.table('texts');
    this.settings = this.table('settings');
  }
}

const db = new MandarinDatabase();

// --- Exported Database Interaction Functions ---

// Vocabulary Operations
export const getVocabulary = (): Promise<VocabularyEntry[]> => {
  return db.vocabulary.toArray();
};

export const addWordToVocabulary = (word: VocabularyEntry): Promise<string> => {
  return db.vocabulary.add(word);
};

export const deleteWordFromVocabulary = (hanzi: string): Promise<void> => {
  return db.vocabulary.delete(hanzi);
};

export const clearVocabulary = (): Promise<void> => {
  return db.vocabulary.clear();
};

export const bulkAddVocabulary = (words: VocabularyEntry[]): Promise<string> => {
  return db.vocabulary.bulkAdd(words);
};


// Text Operations
export const getTexts = (): Promise<TextEntry[]> => {
  return db.texts.toArray();
};

export const addText = (text: TextEntry): Promise<string> => {
  return db.texts.add(text);
};

export const deleteText = (id: string): Promise<void> => {
  return db.texts.delete(id);
};


// Settings Operations
export const getSetting = (key: string): Promise<SettingEntry | undefined> => {
  return db.settings.get(key);
};

export const updateSetting = (setting: SettingEntry): Promise<string> => {
  return db.settings.put(setting);
};


export default db; // Keep default export for potential direct use if needed