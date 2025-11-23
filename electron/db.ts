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
        );

        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folder_id INTEGER,
            title TEXT,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS embeddings (
            note_id INTEGER PRIMARY KEY,
            vector TEXT,
            FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER,
            text TEXT NOT NULL,
            due_date TEXT,
            status TEXT DEFAULT 'pending', -- pending, accepted, dismissed
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
        );
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

export const updateFolder = (id: number, name: string) => {
  const stmt = db.prepare('UPDATE folders SET name = ? WHERE id = ?');
  return stmt.run(name, id);
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

// Vector Operations
export const saveEmbedding = (noteId: number, vector: number[]) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO embeddings (note_id, vector) VALUES (?, ?)');
  // Store vector as JSON string for simplicity in MVP
  return stmt.run(noteId, JSON.stringify(vector));
};

// Simple Cosine Similarity in JS (sufficient for < 1000 notes)
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const searchNotes = (queryVector: number[], limit: number = 5) => {
  const stmt = db.prepare(`
    SELECT notes.*, embeddings.vector 
    FROM notes 
    JOIN embeddings ON notes.id = embeddings.note_id
  `);
  const allNotes = stmt.all();

  const scoredNotes = allNotes.map((note: any) => {
    const vector = JSON.parse(note.vector);
    return {
      ...note,
      score: cosineSimilarity(queryVector, vector)
    };
  });

  // Sort by score descending
  scoredNotes.sort((a: any, b: any) => b.score - a.score);

  return scoredNotes.slice(0, limit);
};

// Reminder Operations
export const getReminders = (noteId: number) => {
  const stmt = db.prepare("SELECT * FROM reminders WHERE note_id = ? AND status = 'pending'");
  return stmt.all(noteId);
};

export const createReminder = (noteId: number, text: string, dueDate: string | null) => {
  const stmt = db.prepare('INSERT INTO reminders (note_id, text, due_date) VALUES (?, ?, ?)');
  return stmt.run(noteId, text, dueDate);
};

export const updateReminderStatus = (id: number, status: string) => {
  const stmt = db.prepare('UPDATE reminders SET status = ? WHERE id = ?');
  return stmt.run(status, id);
};

export const clearPendingReminders = (noteId: number) => {
  const stmt = db.prepare("DELETE FROM reminders WHERE note_id = ? AND status = 'pending'");
  return stmt.run(noteId);
};

