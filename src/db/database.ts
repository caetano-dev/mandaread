import Dexie from 'dexie';

// Define the database schema
class MandarinDatabase extends Dexie {
  vocabulary: Dexie.Table<{ id: string, hanzi: string; pinyin: string; translation: string }, string>;
  texts: Dexie.Table<{ id: string; title: string; content: string }, string>;
  settings: Dexie.Table<{ key: string; value: any }, string>;

  constructor() {
    super('MandarinDatabase');
    this.version(2).stores({
      vocabulary: 'id', // Primary key is the id 
      texts: 'id', // Primary key is the id
      settings: 'key', // Primary key is the key
    });

    this.vocabulary = this.table('vocabulary');
    this.texts = this.table('texts');
    this.settings = this.table('settings');
  }
}

const db = new MandarinDatabase();
export default db;