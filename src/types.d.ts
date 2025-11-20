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
        };
    }
}
