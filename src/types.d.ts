export { };

declare global {
    interface Folder {
        id: number;
        name: string;
        created_at: string;
    }

    interface Note {
        id: number;
        folder_id: number;
        title: string;
        content: string;
        created_at: string;
        updated_at: string;
    }

    interface Window {
        electronAPI: {
            getFolders: () => Promise<Folder[]>;
            createFolder: (name: string) => Promise<void>;
            deleteFolder: (id: number) => Promise<void>;

            getNotes: (folderId: number) => Promise<Note[]>;
            createNote: (folderId: number, title: string, content: string) => Promise<void>;
            updateNote: (id: number, title: string, content: string) => Promise<void>;
            deleteNote: (id: number) => Promise<void>;

            askAI: (question: string) => Promise<string>;
        };
    }
}
