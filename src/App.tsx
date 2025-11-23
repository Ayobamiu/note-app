import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import { ChatInterface } from "./components/ChatInterface";

function App() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Refresh trigger for note list
  const [refreshKey, setRefreshKey] = useState(0);
  const handleNoteUpdate = () => setRefreshKey((prev) => prev + 1);

  const loadFolders = async () => {
    const items = await window.electronAPI.getFolders();
    setFolders(items);
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleCreateFolder = async (name: string) => {
    await window.electronAPI.createFolder(name);
    loadFolders();
  };

  const handleUpdateFolder = async (id: number, name: string) => {
    await window.electronAPI.updateFolder(id, name);
    loadFolders();
  };

  const handleDeleteFolder = async (id: number) => {
    if (confirm("Are you sure you want to delete this folder?")) {
      await window.electronAPI.deleteFolder(id);
      if (selectedFolderId === id) setSelectedFolderId(null);
      loadFolders();
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 relative font-sans text-zinc-900">
      <ChatInterface />

      <Sidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={(id) => {
          setSelectedFolderId(id);
          setSelectedNote(null);
        }}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      {selectedFolderId ? (
        <div className="flex flex-1 overflow-hidden">
          <NoteList
            key={refreshKey} // Force refresh when notes update
            folderId={selectedFolderId}
            onSelectNote={setSelectedNote}
            selectedNoteId={selectedNote?.id || null}
          />

          <main className="flex-1 overflow-y-auto bg-white">
            {selectedNote ? (
              <NoteEditor
                key={selectedNote.id} // Re-mount editor when note changes
                note={selectedNote}
                onUpdate={handleNoteUpdate}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400">
                Select a note to start editing
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-400">
          Select a folder to view notes
        </div>
      )}
    </div>
  );
}

export default App;
