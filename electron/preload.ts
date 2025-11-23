import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    getFolders: () => ipcRenderer.invoke('get-folders'),
    createFolder: (name: string) => ipcRenderer.invoke('create-folder', name),
    updateFolder: (id: number, name: string) => ipcRenderer.invoke('update-folder', id, name),
    deleteFolder: (id: number) => ipcRenderer.invoke('delete-folder', id),

    getNotes: (folderId: number) => ipcRenderer.invoke('get-notes', folderId),
    createNote: (folderId: number, title: string, content: string) => ipcRenderer.invoke('create-note', folderId, title, content),
    updateNote: (id: number, title: string, content: string) => ipcRenderer.invoke('update-note', id, title, content),
    deleteNote: (id: number) => ipcRenderer.invoke('delete-note', id),

    askAI: (question: string, conversationId?: number | null) => ipcRenderer.invoke('ask-ai', question, conversationId),
    getReminders: (noteId: number) => ipcRenderer.invoke('get-reminders', noteId),
    updateReminderStatus: (id: number, status: 'pending' | 'accepted' | 'dismissed') => ipcRenderer.invoke('update-reminder-status', id, status),

    // Conversation APIs
    getConversations: () => ipcRenderer.invoke('get-conversations'),
    getConversation: (id: number) => ipcRenderer.invoke('get-conversation', id),
    createConversation: (title: string) => ipcRenderer.invoke('create-conversation', title),
    updateConversationTitle: (id: number, title: string) => ipcRenderer.invoke('update-conversation-title', id, title),
    deleteConversation: (id: number) => ipcRenderer.invoke('delete-conversation', id),
    getMessages: (conversationId: number) => ipcRenderer.invoke('get-messages', conversationId),
});
