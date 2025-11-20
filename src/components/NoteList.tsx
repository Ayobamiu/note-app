import React, { useState, useEffect } from 'react';

interface NoteListProps {
  folderId: number;
  onSelectNote: (note: Note) => void;
  selectedNoteId: number | null;
}

export const NoteList: React.FC<NoteListProps> = ({ folderId, onSelectNote, selectedNoteId }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  const loadNotes = async () => {
    const loadedNotes = await window.electronAPI.getNotes(folderId);
    setNotes(loadedNotes);
  };

  useEffect(() => {
    loadNotes();
  }, [folderId]);

  const handleCreateNote = async () => {
    await window.electronAPI.createNote(folderId, 'New Note', '');
    loadNotes();
  };

  const handleDeleteNote = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      await window.electronAPI.deleteNote(id);
      if (selectedNoteId === id) onSelectNote({} as Note); // Deselect (hacky but works for now, better to handle in parent)
      loadNotes();
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Notes</h3>
        <button 
          onClick={handleCreateNote}
          className="text-blue-600 hover:text-blue-800 text-xl font-bold"
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onSelectNote(note)}
            className={`group flex justify-between items-start p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedNoteId === note.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="overflow-hidden">
              <h4 className="font-medium text-gray-900 truncate">{note.title || 'Untitled'}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => handleDeleteNote(e, note.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 ml-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
