import Dexie from 'dexie';

// Define the database schema
class MandarinDatabase extends Dexie {
  vocabulary: Dexie.Table<{ word: string; pinyin: string; translation: string }, string>;
  texts: Dexie.Table<{ id: string; title: string; content: string }, string>;

  constructor() {
    super('MandarinDatabase');
    this.version(1).stores({
      vocabulary: 'word', // Primary key is the word
      texts: 'id', // Primary key is the id
    });

    this.vocabulary = this.table('vocabulary');
    this.texts = this.table('texts');
  }
}

const db = new MandarinDatabase();
export default db;