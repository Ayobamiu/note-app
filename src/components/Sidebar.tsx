import React, { useState } from "react";
import { Folder, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: number | null;
  onSelectFolder: (id: number) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
}) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      await onCreateFolder(newFolderName);
      setNewFolderName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-zinc-50 h-full flex flex-col border-r border-zinc-200/50">
      <div className="p-4 pt-6">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-2">
          Library
        </h2>
        <div className="space-y-1">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={clsx(
                "group flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
                selectedFolderId === folder.id
                  ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                  : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
              )}
              onClick={() => onSelectFolder(folder.id)}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder
                  size={16}
                  className={clsx(
                    selectedFolderId === folder.id
                      ? "text-blue-500"
                      : "text-zinc-400"
                  )}
                />
                <span className="truncate font-medium">{folder.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded transition-all"
                title="Delete folder"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {isCreating ? (
          <form onSubmit={handleCreate} className="mt-2 px-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="w-full px-2 py-1.5 text-sm bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              autoFocus
              onBlur={() => !newFolderName && setIsCreating(false)}
            />
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="mt-2 w-full flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-md transition-colors"
          >
            <Plus size={16} />
            <span>New Folder</span>
          </button>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-zinc-200/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-zinc-200/50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">Usman</p>
            <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};
