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

    interface Conversation {
        id: number;
        title: string;
        created_at: string;
        updated_at: string;
    }

    interface ChatMessage {
        id: number;
        conversation_id: number;
        role: 'user' | 'ai';
        content: string;
        created_at: string;
    }

    interface Window {
        electronAPI: {
            getFolders: () => Promise<Folder[]>;
            createFolder: (name: string) => Promise<void>;
            updateFolder: (id: number, name: string) => Promise<void>;
            deleteFolder: (id: number) => Promise<void>;

            getNotes: (folderId: number) => Promise<Note[]>;
            createNote: (folderId: number, title: string, content: string) => Promise<void>;
            updateNote: (id: number, title: string, content: string) => Promise<void>;
            deleteNote: (id: number) => Promise<void>;

            askAI: (question: string, conversationId?: number | null) => Promise<{ answer: string; conversationId: number | null }>;
            getReminders: (noteId: number) => Promise<Reminder[]>;
            updateReminderStatus: (id: number, status: 'pending' | 'accepted' | 'dismissed') => Promise<void>;

            // Conversation APIs
            getConversations: () => Promise<Conversation[]>;
            getConversation: (id: number) => Promise<Conversation | undefined>;
            createConversation: (title: string) => Promise<{ id: number }>;
            updateConversationTitle: (id: number, title: string) => Promise<void>;
            deleteConversation: (id: number) => Promise<void>;
            getMessages: (conversationId: number) => Promise<ChatMessage[]>;
        };
    }
}
