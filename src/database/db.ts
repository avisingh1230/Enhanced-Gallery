import * as SQLite from 'expo-sqlite';
import { SavedImage } from '../types';
import { File, Paths } from 'expo-file-system';
const DB_PATH = 'images.db';
// const db =  SQLite.openDatabaseSync(DB_PATH);
let db: SQLite.SQLiteDatabase;
let firstTime = true;

async function setupDatabase() {
  db = await SQLite.openDatabaseAsync(DB_PATH);
  console.log(SQLite.bundledExtensions)
  const extension = SQLite.bundledExtensions['sqlite-vec']
  if (!extension) {
    throw new Error('sqlite-vec extension not found');
  }
  await db.loadExtensionAsync(extension.libPath, extension.entryPoint);
  console.log('Sqlite database Initialized with Sqlite-vec extension...')
}

const cleanDatabase = async () => {
  
  await db.withExclusiveTransactionAsync(async (tx) => {
    let row = await tx.getFirstAsync<{ name: string }>(
      `SELECT name FROM sqlite_master 
         WHERE type='table' AND name='images';`
    );
    if (row?.name) {
      let images = await tx.getAllAsync<SavedImage>(
        `SELECT * FROM ${row.name};`
      );
      for(let image of images){
        console.log(image.local_uri)
        let file = new File(image.local_uri)
        if(file.exists) file.delete();
      }
      await tx.execAsync(`
        DELETE FROM ${row.name};`
      )
    }
  })
};

export const initDB = async (cleanSlate: boolean) => {
    await setupDatabase();
    if (cleanSlate) {
      await cleanDatabase();
    }
    // 1. Ensure the table exists first
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, local_uri TEXT, desciption TEXT);`
    );
    // 2. Migration: Add the description column if it doesn't exist
    // We wrap this in a try/catch because ALTER TABLE fails if the column already exists
    // try {
    //   db.execSync(`ALTER TABLE images ADD COLUMN description TEXT;`);
    //   console.log("Migration successful: Added description column.");
    // } catch (e) {
    //   // If it fails, the column likely already exists, which is fine!
    //   console.log("Database schema is already up to date.");
    // }
    // const result = db.getFirstSync("SELECT vec_version() AS vec_version") as { vec_version: string };
    // console.log(`sqlite-vec version: ${result.vec_version}`);
};

export const saveImageUri = (uri: string): number => {
  const result = db.runSync('INSERT INTO images (local_uri) VALUES (?);', [uri]);
  return result.lastInsertRowId; // Return the ID so we know which row to update later
};

export const fetchImages = (): SavedImage[] => {
  return db.getAllSync<SavedImage>('SELECT * FROM images');
};


export const deleteImageFromDb = async (id: number): Promise< SavedImage | null> => {
  let deletedImage: SavedImage | null = null;
  await db.withExclusiveTransactionAsync(async(tx)=>{
    const image = await tx.getFirstAsync<SavedImage>(
      'SELECT * FROM images WHERE id = ?;',
      [id]
    );
    if(!image){
      return;
    }
    console.log("Trying to Delete Local URI of Image...");
    console.log(image.local_uri);
    let file = new File(image.local_uri)
    if(file.exists) file.delete();
    
    await tx.execAsync(
      `DELETE FROM images where id = ${image.id};`,
    )
    deletedImage = image;

  }).then(()=>{
    console.log("Delete the Image from file and also its Db Entry...");
  })

  return deletedImage;
};

export const updateImageDescription = (id: number, description: string): void => {
  db.runSync('UPDATE images SET description = ? WHERE id = ?;', [description, id]);
};