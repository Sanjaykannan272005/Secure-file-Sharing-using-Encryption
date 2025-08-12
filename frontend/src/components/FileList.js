import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { createSharingLink, deleteFile } from '../utils/supabaseStorage';
import FilePreview from './FilePreview';
import FileThumbnail from './FileThumbnail';
import AdvancedSharing from './AdvancedSharing';

export default function FileList({ files, onFileDeleted, onFileUpdated }) {
  const [processingFile, setProcessingFile] = useState(null);
  const [sharingStatus, setSharingStatus] = useState({});
  const [showExpirationModal, setShowExpirationModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [expirationOption, setExpirationOption] = useState('1day');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [limitDownloads, setLimitDownloads] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState(5);
  const [allowPreview, setAllowPreview] = useState(true);
  
  // New state for batch operations and filtering
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [previewFile, setPreviewFile] = useState(null);
  const [showAdvancedSharing, setShowAdvancedSharing] = useState(null);
  
  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    let filtered = files.filter(file => {
      const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || 
        (filterType === 'images' && file.originalType?.startsWith('image/')) ||
        (filterType === 'documents' && (file.originalType?.includes('pdf') || file.originalType?.includes('document'))) ||
        (filterType === 'videos' && file.originalType?.startsWith('video/')) ||
        (filterType === 'shared' && file.sharingLink);
      return matchesSearch && matchesType;
    });
    
    // Sort files
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.originalName.toLowerCase();
          bVal = b.originalName.toLowerCase();
          break;
        case 'size':
          aVal = a.originalSize;
          bVal = b.originalSize;
          break;
        case 'type':
          aVal = a.originalType || '';
          bVal = b.originalType || '';
          break;
        default: // date
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [files, searchTerm, filterType, sortBy, sortOrder]);
  
  // Batch operations
  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };
  
  const handleSelectFile = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };
  
  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    const confirmed = window.confirm(`Delete ${selectedFiles.size} selected files? This cannot be undone.`);
    if (!confirmed) return;
    
    try {
      setProcessingFile('batch-delete');
      const deletePromises = Array.from(selectedFiles).map(fileId => deleteFile(fileId));
      await Promise.all(deletePromises);
      
      toast.success(`${selectedFiles.size} files deleted successfully`);
      setSelectedFiles(new Set());
      
      if (onFileDeleted) {
        onFileDeleted(null); // Refresh all files
      }
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Failed to delete some files');
    } finally {
      setProcessingFile(null);
    }
  };
  
  // Show expiration modal
  const handleShareClick = (fileId) => {
    setShowExpirationModal(fileId);
    setExpirationOption('1day');
    setCustomDate('');
    setCustomTime('');
    setSharePassword('');
    setRequirePassword(false);
    setLimitDownloads(false);
    setMaxDownloads(5);
    setAllowPreview(true);
  };

  // Generate sharing link with expiration
  const handleShare = async (fileId) => {
    try {
      setProcessingFile(`share-${fileId}`);
      setSharingStatus(prev => ({ ...prev, [fileId]: 'Creating sharing link...' }));
      
      let expirationDate = null;
      if (expirationOption === 'never') {
        expirationDate = null;
      } else if (expirationOption === 'custom') {
        if (customDate && customTime) {
          expirationDate = new Date(`${customDate}T${customTime}`);
        } else {
          toast.error('Please set custom date and time');
          return;
        }
      } else {
        const hours = {
          '1hour': 1,
          '6hours': 6,
          '1day': 24,
          '3days': 72,
          '1week': 168
        }[expirationOption];
        expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + hours);
      }
      
      const password = requirePassword ? sharePassword : null;
      if (requirePassword && !sharePassword.trim()) {
        toast.error('Please enter a password');
        return;
      }
      
      const downloadLimit = limitDownloads ? maxDownloads : null;
      if (limitDownloads && (!maxDownloads || maxDownloads < 1)) {
        toast.error('Please set a valid download limit');
        return;
      }
      
      const sharingLink = await createSharingLink(fileId, expirationDate, password, downloadLimit, allowPreview);
      
      // Copy to clipboard
      const shareUrl = `${window.location.origin}/shared/${sharingLink.token}`;
      navigator.clipboard.writeText(shareUrl);
      
      toast.success('Sharing link copied to clipboard');
      const expiryText = expirationDate ? 
        `Expires: ${expirationDate.toLocaleString()}` : 'Never expires';
      setSharingStatus(prev => ({ 
        ...prev, 
        [fileId]: `Link created! ${expiryText}` 
      }));
      
      setShowExpirationModal(null);
      
      // Notify parent component to update the specific file
      if (onFileUpdated) {
        onFileUpdated(fileId, { sharingLink });
      } else if (onFileDeleted) {
        onFileDeleted(null); // Fallback to full refresh
      }
    } catch (error) {
      console.error('Error generating sharing link:', error);
      toast.error('Failed to generate sharing link');
      setSharingStatus(prev => ({ ...prev, [fileId]: `Error: ${error.message}` }));
    } finally {
      setProcessingFile(null);
    }
  };
  
  // Show delete confirmation
  const handleDeleteClick = (fileId, fileName) => {
    setShowDeleteModal({ fileId, fileName });
  };

  // Delete file
  const handleDelete = async () => {
    if (!showDeleteModal) return;
    
    try {
      setProcessingFile(`delete-${showDeleteModal.fileId}`);
      
      await deleteFile(showDeleteModal.fileId);
      
      toast.success('File deleted successfully');
      setShowDeleteModal(null);
      
      // Notify parent component
      if (onFileDeleted) {
        onFileDeleted(showDeleteModal.fileId);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    } finally {
      setProcessingFile(null);
    }
  };
  
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
        <p className="text-gray-500">Upload your first file to get started</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Files</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
            <option value="videos">Videos</option>
            <option value="shared">Shared Files</option>
          </select>
          
          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort);
              setSortOrder(order);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
          
          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              📋 Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm border-l ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              🔲 Grid
            </button>
          </div>
        </div>
        
        {/* Batch Actions */}
        {selectedFiles.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedFiles(new Set())}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={processingFile === 'batch-delete'}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
              >
                {processingFile === 'batch-delete' ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Showing {filteredFiles.length} of {files.length} files
      </div>
      
      {/* File Display */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                <tr key={file.id} className={selectedFiles.has(file.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => handleSelectFile(file.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <FileThumbnail file={file} onClick={() => setPreviewFile(file)} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          <button onClick={() => setPreviewFile(file)} className="hover:text-blue-600">
                            {file.originalName}
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 md:hidden">
                          {formatFileSize(file.originalSize)} • {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                {file.sharingLink && (
                  <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded">
                    <div className="font-medium">Sharing Link:</div>
                    <div className="truncate">{`${window.location.origin}/shared/${file.sharingLink.token}`}</div>
                    <div className="mt-1">
                      {file.sharingLink.expiresAt ? 
                        `Expires: ${new Date(file.sharingLink.expiresAt).toLocaleString()}` : 
                        'Never expires'
                      }
                    </div>
                    {file.sharingLink.hasPassword && (
                      <div className="mt-1 text-orange-600">
                        🔒 Password protected
                      </div>
                    )}
                    {file.sharingLink.maxDownloads && (
                      <div className="mt-1 text-blue-600">
                        📊 {file.sharingLink.downloadCount || 0}/{file.sharingLink.maxDownloads} downloads
                      </div>
                    )}
                    {file.sharingLink.allowPreview === false && (
                      <div className="mt-1 text-gray-600">
                        🚫 Preview disabled
                      </div>
                    )}
                  </div>
                )}
                {sharingStatus[file.id] && !file.sharingLink && (
                  <div className="mt-2 text-xs text-blue-700 italic">
                    {sharingStatus[file.id]}
                  </div>
                )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.originalSize)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => setPreviewFile(file)} className="text-green-600 hover:text-green-900" title="Preview">👀</button>
                      {file.sharingLink ? (
                        <>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/shared/${file.sharingLink.token}`);
                              toast.success('Link copied to clipboard');
                            }}
                            className="text-purple-600 hover:text-purple-900" title="Copy Link"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => setShowAdvancedSharing(file)}
                            className="text-green-600 hover:text-green-900" title="Advanced Sharing"
                          >
                            📤
                          </button>
                          <button
                            onClick={() => handleShareClick(file.id)}
                            className="text-blue-600 hover:text-blue-900" title="Edit Link"
                          >
                            ⚙️
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleShareClick(file.id)}
                          disabled={processingFile === `share-${file.id}`}
                          className="text-blue-600 hover:text-blue-900" title="Share"
                        >
                          {processingFile === `share-${file.id}` ? '⏳' : '📤'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(file.id, file.originalName)}
                        disabled={processingFile === `delete-${file.id}`}
                        className="text-red-600 hover:text-red-900" title="Delete"
                      >
                        {processingFile === `delete-${file.id}` ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>
            </tr>
          ))}
        </tbody>
      </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div key={file.id} className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow ${
              selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}>
              <div className="flex items-start justify-between mb-3">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => handleSelectFile(file.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <FileThumbnail file={file} onClick={() => setPreviewFile(file)} />
              </div>
              
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                  {file.originalName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.originalSize)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {file.sharingLink && (
                <div className="mb-3 p-2 bg-green-50 rounded text-xs">
                  <div className="text-green-700 font-medium">🔗 Shared</div>
                  <div className="text-green-600 truncate">
                    {file.sharingLink.expiresAt ? 
                      `Expires: ${new Date(file.sharingLink.expiresAt).toLocaleDateString()}` : 
                      'Never expires'
                    }
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPreviewFile(file)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                  👀 Preview
                </button>
                {file.sharingLink ? (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shared/${file.sharingLink.token}`);
                      toast.success('Link copied!');
                    }}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                  >
                    📋 Copy
                  </button>
                ) : (
                  <button
                    onClick={() => handleShareClick(file.id)}
                    disabled={processingFile === `share-${file.id}`}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    📤 Share
                  </button>
                )}
                {file.sharingLink && (
                  <>
                    <button
                      onClick={() => setShowAdvancedSharing(file)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    >
                      📤 Share+
                    </button>
                    <button
                      onClick={() => handleShareClick(file.id)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      ⚙️ Edit
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteClick(file.id, file.originalName)}
                  disabled={processingFile === `delete-${file.id}`}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 col-span-2"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Expiration Modal */}
      {showExpirationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Set Link Expiration</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="1hour"
                  checked={expirationOption === '1hour'}
                  onChange={(e) => setExpirationOption(e.target.value)}
                  className="mr-2"
                />
                1 Hour
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="6hours"
                  checked={expirationOption === '6hours'}
                  onChange={(e) => setExpirationOption(e.target.value)}
                  className="mr-2"
                />
                6 Hours
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="1day"
                  checked={expirationOption === '1day'}
                  onChange={(e) => setExpirationOption(e.target.value)}
                  className="mr-2"
                />
                1 Day (Default)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="3days"
                  checked={expirationOption === '3days'}
                  onChange={(e) => setExpirationOption(e.target.value)}
                  className="mr-2"
                />
                3 Days
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="1week"
                  checked={expirationOption === '1week'}
                  onChange={(e) => setExpirationOption(e.target.value)}
                  className="mr-2"
                />
                1 Week
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="custom"
                  checked={expirationOption === 'custom'}
                  onChange={(e) => setExpirationOption(e.target.value)}
                  className="mr-2"
                />
                Custom Date & Time
              </label>
              {expirationOption === 'custom' && (
                <div className="ml-6 space-y-2">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              )}
              <label className="flex items-center">
                <input
                  type="radio"
                  value="never"
                  checked={expirationOption === 'never'}
                  onChange={(e) => setExpirationOption(e.target.value)}
                  className="mr-2"
                />
                Never Expire
              </label>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={requirePassword}
                  onChange={(e) => setRequirePassword(e.target.checked)}
                  className="mr-2"
                />
                Password protect this link
              </label>
              {requirePassword && (
                <input
                  type="password"
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border rounded"
                  autoComplete="new-password"
                />
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={limitDownloads}
                  onChange={(e) => setLimitDownloads(e.target.checked)}
                  className="mr-2"
                />
                Limit number of downloads
              </label>
              {limitDownloads && (
                <div className="ml-6">
                  <label className="block text-sm text-gray-600 mb-1">Maximum downloads:</label>
                  <input
                    type="number"
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(parseInt(e.target.value) || 1)}
                    min="1"
                    max="100"
                    className="w-20 px-3 py-2 border rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowPreview}
                  onChange={(e) => setAllowPreview(e.target.checked)}
                  className="mr-2"
                />
                Allow file preview (default: enabled)
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                When disabled, users can only download the file
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExpirationModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleShare(showExpirationModal)}
                disabled={processingFile === `share-${showExpirationModal}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4 text-red-600">Delete File</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{showDeleteModal.fileName}</strong>?
              <br /><br />
              <span className="text-red-600">This action cannot be undone.</span>
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={processingFile === `delete-${showDeleteModal.fileId}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={processingFile === `delete-${showDeleteModal.fileId}`}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {processingFile === `delete-${showDeleteModal.fileId}` ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* File Preview Modal */}
      <FilePreview 
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
      
      {/* Advanced Sharing Modal */}
      {showAdvancedSharing && (
        <AdvancedSharing 
          file={showAdvancedSharing}
          sharingLink={showAdvancedSharing.sharingLink}
          onClose={() => setShowAdvancedSharing(null)}
        />
      )}
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file icon
function getFileIcon(mimeType) {
  if (!mimeType) return '📄';
  
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '🗜️';
  if (mimeType.includes('text')) return '📄';
  
  return '📎';
}