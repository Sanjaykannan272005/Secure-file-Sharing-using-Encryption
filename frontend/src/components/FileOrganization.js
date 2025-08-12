import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function FileOrganization({ files, onFileUpdate, onFolderChange }) {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [tags, setTags] = useState({});
  const [recentFiles, setRecentFiles] = useState([]);

  useEffect(() => {
    // Load favorites and tags from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('fileFavorites') || '[]');
    const savedTags = JSON.parse(localStorage.getItem('fileTags') || '{}');
    setFavorites(new Set(savedFavorites));
    setTags(savedTags);
    
    // Calculate recent files (last 7 days)
    const recent = files.filter(file => {
      const fileDate = new Date(file.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return fileDate > weekAgo;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRecentFiles(recent);
  }, [files]);

  const createFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      createdAt: new Date().toISOString(),
      fileCount: 0
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowCreateFolder(false);
    toast.success('Folder created successfully');
  };

  const toggleFavorite = (fileId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(fileId)) {
      newFavorites.delete(fileId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(fileId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
    localStorage.setItem('fileFavorites', JSON.stringify([...newFavorites]));
  };

  const addTag = (fileId, tag) => {
    if (!tag.trim()) return;
    
    const newTags = { ...tags };
    if (!newTags[fileId]) newTags[fileId] = [];
    if (!newTags[fileId].includes(tag)) {
      newTags[fileId].push(tag);
      setTags(newTags);
      localStorage.setItem('fileTags', JSON.stringify(newTags));
      toast.success('Tag added');
    }
  };

  const removeTag = (fileId, tag) => {
    const newTags = { ...tags };
    if (newTags[fileId]) {
      newTags[fileId] = newTags[fileId].filter(t => t !== tag);
      if (newTags[fileId].length === 0) delete newTags[fileId];
      setTags(newTags);
      localStorage.setItem('fileTags', JSON.stringify(newTags));
    }
  };

  const favoriteFiles = files.filter(file => favorites.has(file.id));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">📁 File Organization</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{files.length}</div>
          <div className="text-sm text-blue-800">Total Files</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{folders.length}</div>
          <div className="text-sm text-green-800">Folders</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{favorites.size}</div>
          <div className="text-sm text-purple-800">Favorites</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{recentFiles.length}</div>
          <div className="text-sm text-orange-800">Recent</div>
        </div>
      </div>

      {/* Folders Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">📂 Folders</h3>
          <button
            onClick={() => setShowCreateFolder(true)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            + New Folder
          </button>
        </div>

        {showCreateFolder && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              />
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {folders.map(folder => (
            <div
              key={folder.id}
              onClick={() => {
                setCurrentFolder(folder);
                onFolderChange?.(folder);
              }}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm font-medium truncate">{folder.name}</div>
              <div className="text-xs text-gray-500">{folder.fileCount} files</div>
            </div>
          ))}
        </div>
      </div>

      {/* Favorites Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">⭐ Favorites</h3>
        {favoriteFiles.length > 0 ? (
          <div className="space-y-2">
            {favoriteFiles.slice(0, 5).map(file => (
              <div key={file.id} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded">
                <span className="text-xl">⭐</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{file.originalName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(file.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            ))}
            {favoriteFiles.length > 5 && (
              <div className="text-sm text-gray-500 text-center">
                +{favoriteFiles.length - 5} more favorites
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No favorite files yet</p>
        )}
      </div>

      {/* Recent Files */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">🕒 Recent Files</h3>
        {recentFiles.length > 0 ? (
          <div className="space-y-2">
            {recentFiles.slice(0, 5).map(file => (
              <div key={file.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                <span className="text-xl">📄</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{file.originalName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(file.id)}
                  className={`${favorites.has(file.id) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                >
                  ⭐
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent files</p>
        )}
      </div>

      {/* Tags Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🏷️ Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(tags).flat().reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {}) && Object.entries(
            Object.values(tags).flat().reduce((acc, tag) => {
              acc[tag] = (acc[tag] || 0) + 1;
              return acc;
            }, {})
          ).sort(([,a], [,b]) => b - a).slice(0, 10).map(([tag, count]) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag} ({count})
            </span>
          ))}
        </div>
      </div>

      {/* File Actions Helper */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Quick Actions:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Click ⭐ next to any file to add to favorites</div>
          <div>• Use tags to categorize your files</div>
          <div>• Create folders to organize related files</div>
          <div>• Recent files show uploads from the last 7 days</div>
        </div>
      </div>
    </div>
  );
}