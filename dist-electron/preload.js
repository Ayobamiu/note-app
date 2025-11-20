"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getFolders: () => electron_1.ipcRenderer.invoke('get-folders'),
    createFolder: (name) => electron_1.ipcRenderer.invoke('create-folder', name),
    deleteFolder: (id) => electron_1.ipcRenderer.invoke('delete-folder', id),
    getNotes: (folderId) => electron_1.ipcRenderer.invoke('get-notes', folderId),
    createNote: (folderId, title, content) => electron_1.ipcRenderer.invoke('create-note', folderId, title, content),
    updateNote: (id, title, content) => electron_1.ipcRenderer.invoke('update-note', id, title, content),
    deleteNote: (id) => electron_1.ipcRenderer.invoke('delete-note', id),
    askAI: (question) => electron_1.ipcRenderer.invoke('ask-ai', question),
});
