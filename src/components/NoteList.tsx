import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

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
      if (selectedNoteId === id) onSelectNote({} as Note);
      loadNotes();
    }
  };

  return (
    <div className="w-64 bg-white border-r border-zinc-200 h-full flex flex-col">
      <div className="p-3 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
          Notes
        </span>
        <button 
          onClick={handleCreateNote}
          className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-colors"
          title="New Note"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 && (
          <div className="p-8 text-center text-zinc-400 text-sm">
            No notes yet
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onSelectNote(note)}
            className={clsx(
              "group relative p-3 border-b border-zinc-100 cursor-pointer transition-all hover:bg-zinc-50",
              selectedNoteId === note.id ? "bg-white ring-1 ring-inset ring-zinc-200 z-10" : "bg-white"
            )}
          >
            <div className="pr-6">
              <h4 className={clsx(
                "font-medium text-sm truncate mb-1",
                selectedNoteId === note.id ? "text-zinc-900" : "text-zinc-700"
              )}>
                {note.title || 'Untitled'}
              </h4>
              <p className="text-xs text-zinc-400">
                {new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            {selectedNoteId === note.id && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-900" />
            )}

            <button
              onClick={(e) => handleDeleteNote(e, note.id)}
              className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
