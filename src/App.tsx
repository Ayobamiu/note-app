import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';

function App() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Refresh trigger for note list
  const [refreshKey, setRefreshKey] = useState(0);
  const handleNoteUpdate = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        onSelectFolder={(id) => {
          setSelectedFolderId(id);
          setSelectedNote(null);
        }} 
        selectedFolderId={selectedFolderId} 
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
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a note to start editing
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a folder to view notes
        </div>
      )}
    </div>
  )
}

export default App
