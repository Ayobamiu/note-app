import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    getFolders: () => ipcRenderer.invoke('get-folders'),
    createFolder: (name: string) => ipcRenderer.invoke('create-folder', name),
    deleteFolder: (id: number) => ipcRenderer.invoke('delete-folder', id),
});
