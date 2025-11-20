"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNotes = exports.saveEmbedding = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNotes = exports.deleteFolder = exports.createFolder = exports.getFolders = void 0;
exports.initDB = initDB;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'notes.db');
const db = new better_sqlite3_1.default(dbPath);
// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
function initDB() {
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
exports.default = db;
// Folder Operations
const getFolders = () => {
    const stmt = db.prepare('SELECT * FROM folders ORDER BY created_at DESC');
    return stmt.all();
};
exports.getFolders = getFolders;
const createFolder = (name) => {
    const stmt = db.prepare('INSERT INTO folders (name) VALUES (?)');
    return stmt.run(name);
};
exports.createFolder = createFolder;
const deleteFolder = (id) => {
    const stmt = db.prepare('DELETE FROM folders WHERE id = ?');
    return stmt.run(id);
};
exports.deleteFolder = deleteFolder;
// Note Operations
const getNotes = (folderId) => {
    const stmt = db.prepare('SELECT * FROM notes WHERE folder_id = ? ORDER BY updated_at DESC');
    return stmt.all(folderId);
};
exports.getNotes = getNotes;
const createNote = (folderId, title, content) => {
    const stmt = db.prepare('INSERT INTO notes (folder_id, title, content) VALUES (?, ?, ?)');
    return stmt.run(folderId, title, content);
};
exports.createNote = createNote;
const updateNote = (id, title, content) => {
    const stmt = db.prepare('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(title, content, id);
};
exports.updateNote = updateNote;
const deleteNote = (id) => {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    return stmt.run(id);
};
exports.deleteNote = deleteNote;
// Vector Operations
const saveEmbedding = (noteId, vector) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO embeddings (note_id, vector) VALUES (?, ?)');
    // Store vector as JSON string for simplicity in MVP
    return stmt.run(noteId, JSON.stringify(vector));
};
exports.saveEmbedding = saveEmbedding;
// Simple Cosine Similarity in JS (sufficient for < 1000 notes)
function cosineSimilarity(vecA, vecB) {
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
const searchNotes = (queryVector, limit = 5) => {
    const stmt = db.prepare(`
    SELECT notes.*, embeddings.vector 
    FROM notes 
    JOIN embeddings ON notes.id = embeddings.note_id
  `);
    const allNotes = stmt.all();
    const scoredNotes = allNotes.map((note) => {
        const vector = JSON.parse(note.vector);
        return {
            ...note,
            score: cosineSimilarity(queryVector, vector)
        };
    });
    // Sort by score descending
    scoredNotes.sort((a, b) => b.score - a.score);
    return scoredNotes.slice(0, limit);
};
exports.searchNotes = searchNotes;
