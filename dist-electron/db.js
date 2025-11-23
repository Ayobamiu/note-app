"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationNotes = exports.linkConversationToNotes = exports.getMessages = exports.saveMessage = exports.deleteConversation = exports.updateConversationTitle = exports.getConversation = exports.getConversations = exports.createConversation = exports.clearPendingReminders = exports.updateReminderStatus = exports.createReminder = exports.getReminders = exports.searchNotes = exports.saveEmbedding = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNotes = exports.deleteFolder = exports.updateFolder = exports.createFolder = exports.getFolders = void 0;
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

        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            role TEXT NOT NULL, -- 'user' or 'ai'
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS conversation_notes (
            conversation_id INTEGER,
            note_id INTEGER,
            FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE,
            PRIMARY KEY (conversation_id, note_id)
        );
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
const updateFolder = (id, name) => {
    const stmt = db.prepare('UPDATE folders SET name = ? WHERE id = ?');
    return stmt.run(name, id);
};
exports.updateFolder = updateFolder;
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
// Reminder Operations
const getReminders = (noteId) => {
    const stmt = db.prepare("SELECT * FROM reminders WHERE note_id = ? AND status = 'pending'");
    return stmt.all(noteId);
};
exports.getReminders = getReminders;
const createReminder = (noteId, text, dueDate) => {
    const stmt = db.prepare('INSERT INTO reminders (note_id, text, due_date) VALUES (?, ?, ?)');
    return stmt.run(noteId, text, dueDate);
};
exports.createReminder = createReminder;
const updateReminderStatus = (id, status) => {
    const stmt = db.prepare('UPDATE reminders SET status = ? WHERE id = ?');
    return stmt.run(status, id);
};
exports.updateReminderStatus = updateReminderStatus;
const clearPendingReminders = (noteId) => {
    const stmt = db.prepare("DELETE FROM reminders WHERE note_id = ? AND status = 'pending'");
    return stmt.run(noteId);
};
exports.clearPendingReminders = clearPendingReminders;
// Conversation Operations
const createConversation = (title) => {
    const stmt = db.prepare('INSERT INTO conversations (title) VALUES (?)');
    return stmt.run(title);
};
exports.createConversation = createConversation;
const getConversations = () => {
    const stmt = db.prepare('SELECT * FROM conversations ORDER BY updated_at DESC');
    return stmt.all();
};
exports.getConversations = getConversations;
const getConversation = (id) => {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id);
};
exports.getConversation = getConversation;
const updateConversationTitle = (id, title) => {
    const stmt = db.prepare('UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(title, id);
};
exports.updateConversationTitle = updateConversationTitle;
const deleteConversation = (id) => {
    const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
    return stmt.run(id);
};
exports.deleteConversation = deleteConversation;
// Message Operations
const saveMessage = (conversationId, role, content) => {
    const stmt = db.prepare('INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, ?, ?)');
    return stmt.run(conversationId, role, content);
};
exports.saveMessage = saveMessage;
const getMessages = (conversationId) => {
    const stmt = db.prepare('SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC');
    return stmt.all(conversationId);
};
exports.getMessages = getMessages;
// Conversation Notes Operations (for tracking which notes were used)
const linkConversationToNotes = (conversationId, noteIds) => {
    const stmt = db.prepare('INSERT OR IGNORE INTO conversation_notes (conversation_id, note_id) VALUES (?, ?)');
    const insertMany = db.transaction((ids) => {
        for (const noteId of ids) {
            stmt.run(conversationId, noteId);
        }
    });
    insertMany(noteIds);
};
exports.linkConversationToNotes = linkConversationToNotes;
const getConversationNotes = (conversationId) => {
    const stmt = db.prepare(`
    SELECT notes.* 
    FROM notes 
    JOIN conversation_notes ON notes.id = conversation_notes.note_id 
    WHERE conversation_notes.conversation_id = ?
  `);
    return stmt.all(conversationId);
};
exports.getConversationNotes = getConversationNotes;
