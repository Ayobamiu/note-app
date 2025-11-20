import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { initDB, getFolders, createFolder, deleteFolder, getNotes, createNote, updateNote, deleteNote } from './db';

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
    ipcMain.handle('delete-folder', (event: IpcMainInvokeEvent, id: number) => deleteFolder(id));

    // Note Handlers
    ipcMain.handle('get-notes', (event: IpcMainInvokeEvent, folderId: number) => getNotes(folderId));
    ipcMain.handle('create-note', (event: IpcMainInvokeEvent, folderId: number, title: string, content: string) => createNote(folderId, title, content));
    ipcMain.handle('update-note', (event: IpcMainInvokeEvent, id: number, title: string, content: string) => updateNote(id, title, content));
    ipcMain.handle('delete-note', (event: IpcMainInvokeEvent, id: number) => deleteNote(id));

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
