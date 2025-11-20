import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    getFolders: () => ipcRenderer.invoke('get-folders'),
    createFolder: (name: string) => ipcRenderer.invoke('create-folder', name),
    deleteFolder: (id: number) => ipcRenderer.invoke('delete-folder', id),

    getNotes: (folderId: number) => ipcRenderer.invoke('get-notes', folderId),
    createNote: (folderId: number, title: string, content: string) => ipcRenderer.invoke('create-note', folderId, title, content),
    updateNote: (id: number, title: string, content: string) => ipcRenderer.invoke('update-note', id, title, content),
    deleteNote: (id: number) => ipcRenderer.invoke('delete-note', id),

    askAI: (question: string) => ipcRenderer.invoke('ask-ai', question),
    getReminders: (noteId: number) => ipcRenderer.invoke('get-reminders', noteId),
});
