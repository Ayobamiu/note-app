import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';
import clsx from 'clsx';

import { ReminderList } from './ReminderList';

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
      BubbleMenuExtension,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc prose-lg max-w-none focus:outline-none min-h-[500px] selection:bg-zinc-200',
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
    <div className="flex-1 h-full flex flex-col bg-white overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full py-12 px-8">
        <ReminderList noteId={note.id} />
        
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="text-4xl font-bold text-zinc-900 placeholder-zinc-300 border-none focus:outline-none w-full mb-8 bg-transparent"
        />
        
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 bg-zinc-900 text-zinc-100 px-2 py-1 rounded-lg shadow-xl border border-zinc-800">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={clsx("p-1.5 rounded hover:bg-zinc-700 transition-colors", editor.isActive('bold') && "bg-zinc-700 text-white")}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={clsx("p-1.5 rounded hover:bg-zinc-700 transition-colors", editor.isActive('italic') && "bg-zinc-700 text-white")}
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={clsx("p-1.5 rounded hover:bg-zinc-700 transition-colors", editor.isActive('strike') && "bg-zinc-700 text-white")}
            >
              <Strikethrough size={16} />
            </button>
            <div className="w-px h-4 bg-zinc-700 mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={clsx("p-1.5 rounded hover:bg-zinc-700 transition-colors", editor.isActive('bulletList') && "bg-zinc-700 text-white")}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={clsx("p-1.5 rounded hover:bg-zinc-700 transition-colors", editor.isActive('orderedList') && "bg-zinc-700 text-white")}
            >
              <ListOrdered size={16} />
            </button>
          </BubbleMenu>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
