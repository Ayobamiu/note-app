import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface NoteEditorProps {
  note: Note;
  onUpdate: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdate }) => {
  const [title, setTitle] = useState(note.title);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: async ({ editor }) => {
      const content = editor.getHTML();
      await window.electronAPI.updateNote(note.id, title, content);
      onUpdate(); // Trigger refresh in list
    },
  });

  // Update editor content when note changes
  useEffect(() => {
    if (editor && note) {
      setTitle(note.title);
      // Only set content if it's different to avoid cursor jumps
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content);
      }
    }
  }, [note.id, editor]);

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (editor) {
      await window.electronAPI.updateNote(note.id, newTitle, editor.getHTML());
      onUpdate();
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-white">
      <div className="p-8 max-w-3xl mx-auto w-full">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:outline-none w-full mb-8"
        />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
