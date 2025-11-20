import React, { useState, useEffect } from 'react';

interface SidebarProps {
  onSelectFolder: (folderId: number) => void;
  selectedFolderId: number | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectFolder, selectedFolderId }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');

  const loadFolders = async () => {
    const loadedFolders = await window.electronAPI.getFolders();
    setFolders(loadedFolders);
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    await window.electronAPI.createFolder(newFolderName);
    setNewFolderName('');
    loadFolders();
  };

  const handleDeleteFolder = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this folder?')) {
      await window.electronAPI.deleteFolder(id);
      if (selectedFolderId === id) onSelectFolder(0); // Deselect if deleted
      loadFolders();
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold mb-4">Folders</h2>
        <form onSubmit={handleCreateFolder} className="flex gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New Folder..."
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
          >
            +
          </button>
        </form>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onSelectFolder(folder.id)}
            className={`group flex items-center justify-between p-2 rounded cursor-pointer mb-1 ${
              selectedFolderId === folder.id ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <span className="truncate">{folder.name}</span>
            <button
              onClick={(e) => handleDeleteFolder(e, folder.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
