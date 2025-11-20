"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getFolders: () => electron_1.ipcRenderer.invoke('get-folders'),
    createFolder: (name) => electron_1.ipcRenderer.invoke('create-folder', name),
    deleteFolder: (id) => electron_1.ipcRenderer.invoke('delete-folder', id),
});
