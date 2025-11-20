import { useState } from 'react';
import { Sidebar } from './components/Sidebar';

function App() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        onSelectFolder={setSelectedFolderId} 
        selectedFolderId={selectedFolderId} 
      />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {selectedFolderId ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Notes in Folder {selectedFolderId}</h2>
            <p className="text-gray-600">Note list coming soon...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a folder to view notes
          </div>
        )}
      </main>
    </div>
  )
}

export default App
