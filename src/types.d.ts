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

    interface Reminder {
        id: number;
        note_id: number;
        text: string;
        due_date: string | null;
        status: 'pending' | 'accepted' | 'dismissed';
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
            getReminders: (noteId: number) => Promise<Reminder[]>;
        };
    }
}
