"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getFolders: () => electron_1.ipcRenderer.invoke('get-folders'),
    createFolder: (name) => electron_1.ipcRenderer.invoke('create-folder', name),
    updateFolder: (id, name) => electron_1.ipcRenderer.invoke('update-folder', id, name),
    deleteFolder: (id) => electron_1.ipcRenderer.invoke('delete-folder', id),
    getNotes: (folderId) => electron_1.ipcRenderer.invoke('get-notes', folderId),
    createNote: (folderId, title, content) => electron_1.ipcRenderer.invoke('create-note', folderId, title, content),
    updateNote: (id, title, content) => electron_1.ipcRenderer.invoke('update-note', id, title, content),
    deleteNote: (id) => electron_1.ipcRenderer.invoke('delete-note', id),
    askAI: (question, conversationId) => electron_1.ipcRenderer.invoke('ask-ai', question, conversationId),
    getReminders: (noteId) => electron_1.ipcRenderer.invoke('get-reminders', noteId),
    updateReminderStatus: (id, status) => electron_1.ipcRenderer.invoke('update-reminder-status', id, status),
    // Conversation APIs
    getConversations: () => electron_1.ipcRenderer.invoke('get-conversations'),
    getConversation: (id) => electron_1.ipcRenderer.invoke('get-conversation', id),
    createConversation: (title) => electron_1.ipcRenderer.invoke('create-conversation', title),
    updateConversationTitle: (id, title) => electron_1.ipcRenderer.invoke('update-conversation-title', id, title),
    deleteConversation: (id) => electron_1.ipcRenderer.invoke('delete-conversation', id),
    getMessages: (conversationId) => electron_1.ipcRenderer.invoke('get-messages', conversationId),
});
