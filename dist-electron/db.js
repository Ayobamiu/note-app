"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolder = exports.createFolder = exports.getFolders = void 0;
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
