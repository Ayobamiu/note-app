import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { initDB, getFolders, createFolder, updateFolder, deleteFolder, getNotes, createNote, updateNote, deleteNote, getReminders, createReminder, updateReminderStatus, clearPendingReminders } from './db';
import { aiManager } from './ai/manager';

// Initialize database
initDB();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // IPC Handlers
    ipcMain.handle('get-folders', () => getFolders());
    ipcMain.handle('create-folder', (event: IpcMainInvokeEvent, name: string) => createFolder(name));
    ipcMain.handle('update-folder', (event: IpcMainInvokeEvent, id: number, name: string) => updateFolder(id, name));
    ipcMain.handle('delete-folder', (event: IpcMainInvokeEvent, id: number) => deleteFolder(id));

    // Note Handlers
    ipcMain.handle('get-notes', (event: IpcMainInvokeEvent, folderId: number) => getNotes(folderId));
    ipcMain.handle('create-note', async (event: IpcMainInvokeEvent, folderId: number, title: string, content: string) => {
        const result = createNote(folderId, title, content);
        const id = result.lastInsertRowid as number;

        // Generate embedding and reminders in background
        try {
            const text = `${title}\n${content}`;
            const provider = aiManager.getProvider();

            // Embeddings
            const embedding = await provider.generateEmbedding(text);
            if (embedding.length > 0) {
                const { saveEmbedding } = await import('./db');
                saveEmbedding(id, embedding);
            }

            // Reminders
            const reminders = await provider.extractReminders(text);
            if (reminders.length > 0) {
                const { createReminder } = await import('./db');
                reminders.forEach(r => createReminder(id, r.text, r.due_date));
            }
        } catch (error) {
            console.error('Failed to generate AI metadata:', error);
        }

        return result;
    });
    ipcMain.handle('update-note', async (event: IpcMainInvokeEvent, id: number, title: string, content: string) => {
        console.log(`[IPC] update-note called for id: ${id}`);
        const result = updateNote(id, title, content);

        // Update embedding and reminders in background
        try {
            const text = `${title}\n${content}`;
            console.log('[AI] Getting provider...');
            const provider = aiManager.getProvider();

            // Embeddings
            console.log('[AI] Generating embedding...');
            const embedding = await provider.generateEmbedding(text);
            if (embedding.length > 0) {
                const { saveEmbedding } = await import('./db');
                saveEmbedding(id, embedding);
            }

            // Reminders
            console.log('[AI] Extracting reminders...');
            const reminders = await provider.extractReminders(text);
            console.log(`[AI] Extracted ${reminders.length} reminders`);

            if (reminders.length > 0) {
                const { createReminder, clearPendingReminders } = await import('./db');
                // Clear existing pending reminders to avoid duplicates
                clearPendingReminders(id);
                reminders.forEach(r => createReminder(id, r.text, r.due_date));
            }
        } catch (error) {
            console.error('Failed to update AI metadata:', error);
        }

        return result;
    });
    ipcMain.handle('delete-note', (event: IpcMainInvokeEvent, id: number) => deleteNote(id));
    ipcMain.handle('get-reminders', (event: IpcMainInvokeEvent, noteId: number) => getReminders(noteId));
    ipcMain.handle('update-reminder-status', (event: IpcMainInvokeEvent, id: number, status: 'pending' | 'accepted' | 'dismissed') => updateReminderStatus(id, status));

    // AI Handlers
    ipcMain.handle('ask-ai', async (event: IpcMainInvokeEvent, question: string) => {
        try {
            const provider = aiManager.getProvider();

            // 1. Embed question
            const queryVector = await provider.generateEmbedding(question);

            // 2. Search relevant notes
            const { searchNotes } = await import('./db');
            const relevantNotes = searchNotes(queryVector, 5);

            // 3. Construct context
            const context = relevantNotes.map((n: any) => `Title: ${n.title}\nContent: ${n.content}`).join('\n\n');

            // 4. Generate answer
            const answer = await provider.generateCompletion(question, context);
            return answer;
        } catch (error) {
            console.error('AI Error:', error);
            return "Sorry, I encountered an error while thinking.";
        }
    });

    // In production, load the index.html of the app.
    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        // In development, load the URL from the Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
