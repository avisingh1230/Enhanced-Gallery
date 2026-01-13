import * as SQLite from 'expo-sqlite';
import { SavedImage } from '../types';

const db = SQLite.openDatabaseSync('images.db');

export const initDB = (): void => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, local_uri TEXT);`
  );
};

export const saveImageUri = (uri: string): void => {
  db.runSync('INSERT INTO images (local_uri) VALUES (?);', [uri]);
};

export const fetchImages = (): SavedImage[] => {
  return db.getAllSync<SavedImage>('SELECT * FROM images');
};