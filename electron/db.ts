import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'notes.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

export function initDB() {
  // Create folders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder_id INTEGER,
      title TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders (id)
    )
  `);

  // Create embeddings table (placeholder for now)
  db.exec(`
    CREATE TABLE IF NOT EXISTS embeddings (
      note_id INTEGER PRIMARY KEY,
      vector BLOB,
      FOREIGN KEY (note_id) REFERENCES notes (id)
    )
  `);

  console.log('Database initialized at', dbPath);
}

export default db;

// Folder Operations
export const getFolders = () => {
  const stmt = db.prepare('SELECT * FROM folders ORDER BY created_at DESC');
  return stmt.all();
};

export const createFolder = (name: string) => {
  const stmt = db.prepare('INSERT INTO folders (name) VALUES (?)');
  return stmt.run(name);
};

export const deleteFolder = (id: number) => {
  const stmt = db.prepare('DELETE FROM folders WHERE id = ?');
  return stmt.run(id);
};

// Note Operations
export const getNotes = (folderId: number) => {
  const stmt = db.prepare('SELECT * FROM notes WHERE folder_id = ? ORDER BY updated_at DESC');
  return stmt.all(folderId);
};

export const createNote = (folderId: number, title: string, content: string) => {
  const stmt = db.prepare('INSERT INTO notes (folder_id, title, content) VALUES (?, ?, ?)');
  return stmt.run(folderId, title, content);
};

export const updateNote = (id: number, title: string, content: string) => {
  const stmt = db.prepare('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(title, content, id);
};

export const deleteNote = (id: number) => {
  const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
  return stmt.run(id);
};

