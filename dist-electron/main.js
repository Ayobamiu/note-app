"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const manager_1 = require("./ai/manager");
// Initialize database
(0, db_1.initDB)();
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    // IPC Handlers
    electron_1.ipcMain.handle('get-folders', () => (0, db_1.getFolders)());
    electron_1.ipcMain.handle('create-folder', (event, name) => (0, db_1.createFolder)(name));
    electron_1.ipcMain.handle('update-folder', (event, id, name) => (0, db_1.updateFolder)(id, name));
    electron_1.ipcMain.handle('delete-folder', (event, id) => (0, db_1.deleteFolder)(id));
    // Note Handlers
    electron_1.ipcMain.handle('get-notes', (event, folderId) => (0, db_1.getNotes)(folderId));
    electron_1.ipcMain.handle('create-note', async (event, folderId, title, content) => {
        const result = (0, db_1.createNote)(folderId, title, content);
        const id = result.lastInsertRowid;
        // Generate embedding and reminders in background
        try {
            const text = `${title}\n${content}`;
            const provider = manager_1.aiManager.getProvider();
            // Embeddings
            const embedding = await provider.generateEmbedding(text);
            if (embedding.length > 0) {
                const { saveEmbedding } = await Promise.resolve().then(() => __importStar(require('./db')));
                saveEmbedding(id, embedding);
            }
            // Reminders
            const reminders = await provider.extractReminders(text);
            if (reminders.length > 0) {
                const { createReminder } = await Promise.resolve().then(() => __importStar(require('./db')));
                reminders.forEach(r => createReminder(id, r.text, r.due_date));
            }
        }
        catch (error) {
            console.error('Failed to generate AI metadata:', error);
        }
        return result;
    });
    electron_1.ipcMain.handle('update-note', async (event, id, title, content) => {
        console.log(`[IPC] update-note called for id: ${id}`);
        const result = (0, db_1.updateNote)(id, title, content);
        // Update embedding and reminders in background
        try {
            const text = `${title}\n${content}`;
            console.log('[AI] Getting provider...');
            const provider = manager_1.aiManager.getProvider();
            // Embeddings
            console.log('[AI] Generating embedding...');
            const embedding = await provider.generateEmbedding(text);
            if (embedding.length > 0) {
                const { saveEmbedding } = await Promise.resolve().then(() => __importStar(require('./db')));
                saveEmbedding(id, embedding);
            }
            // Reminders
            console.log('[AI] Extracting reminders...');
            const reminders = await provider.extractReminders(text);
            console.log(`[AI] Extracted ${reminders.length} reminders`);
            if (reminders.length > 0) {
                const { createReminder, clearPendingReminders } = await Promise.resolve().then(() => __importStar(require('./db')));
                // Clear existing pending reminders to avoid duplicates
                clearPendingReminders(id);
                reminders.forEach(r => createReminder(id, r.text, r.due_date));
            }
        }
        catch (error) {
            console.error('Failed to update AI metadata:', error);
        }
        return result;
    });
    electron_1.ipcMain.handle('delete-note', (event, id) => (0, db_1.deleteNote)(id));
    electron_1.ipcMain.handle('get-reminders', (event, noteId) => (0, db_1.getReminders)(noteId));
    electron_1.ipcMain.handle('update-reminder-status', (event, id, status) => (0, db_1.updateReminderStatus)(id, status));
    // AI Handlers
    electron_1.ipcMain.handle('ask-ai', async (event, question, conversationId = null) => {
        try {
            const provider = manager_1.aiManager.getProvider();
            // 1. Embed question
            const queryVector = await provider.generateEmbedding(question);
            // 2. Search relevant notes
            const { searchNotes } = await Promise.resolve().then(() => __importStar(require('./db')));
            const relevantNotes = searchNotes(queryVector, 5);
            const noteIds = relevantNotes.map((n) => n.id);
            // 3. Construct context
            const context = relevantNotes.map((n) => `Title: ${n.title}\nContent: ${n.content}`).join('\n\n');
            // 4. Generate answer
            const answer = await provider.generateCompletion(question, context);
            // 5. Create or get conversation
            let currentConversationId = conversationId;
            if (!currentConversationId) {
                // Auto-generate title from first 50 chars of question
                const title = question.length > 50 ? question.substring(0, 50) + '...' : question;
                const result = (0, db_1.createConversation)(title);
                currentConversationId = result.lastInsertRowid;
            }
            // 6. Save messages
            (0, db_1.saveMessage)(currentConversationId, 'user', question);
            (0, db_1.saveMessage)(currentConversationId, 'ai', answer);
            // 7. Link relevant notes to conversation
            if (noteIds.length > 0) {
                (0, db_1.linkConversationToNotes)(currentConversationId, noteIds);
            }
            // 8. Update conversation timestamp (refresh updated_at)
            const currentConversation = (0, db_1.getConversation)(currentConversationId);
            if (currentConversation) {
                (0, db_1.updateConversationTitle)(currentConversationId, currentConversation.title);
            }
            return { answer, conversationId: currentConversationId };
        }
        catch (error) {
            console.error('AI Error:', error);
            return { answer: "Sorry, I encountered an error while thinking.", conversationId: null };
        }
    });
    // Conversation Handlers
    electron_1.ipcMain.handle('get-conversations', () => (0, db_1.getConversations)());
    electron_1.ipcMain.handle('get-conversation', (event, id) => (0, db_1.getConversation)(id));
    electron_1.ipcMain.handle('create-conversation', (event, title) => {
        const result = (0, db_1.createConversation)(title);
        return { id: result.lastInsertRowid };
    });
    electron_1.ipcMain.handle('update-conversation-title', (event, id, title) => {
        return (0, db_1.updateConversationTitle)(id, title);
    });
    electron_1.ipcMain.handle('delete-conversation', (event, id) => {
        return (0, db_1.deleteConversation)(id);
    });
    electron_1.ipcMain.handle('get-messages', (event, conversationId) => (0, db_1.getMessages)(conversationId));
    // In production, load the index.html of the app.
    if (electron_1.app.isPackaged) {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    else {
        // In development, load the URL from the Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', createWindow);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
