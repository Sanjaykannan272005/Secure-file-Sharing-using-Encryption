import { useState } from 'react';
import { toast } from 'react-toastify';
import { createSharingLink, deleteFile } from '../utils/supabaseStorage'; // Using Supabase storage

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
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't uploaded any files yet</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uploaded
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {file.originalName}
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {formatFileSize(file.originalSize)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {new Date(file.createdAt).toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {file.sharingLink ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/shared/${file.sharingLink.token}`);
                        toast.success('Link copied to clipboard');
                      }}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleShareClick(file.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit Link
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleShareClick(file.id)}
                    disabled={processingFile === `share-${file.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {processingFile === `share-${file.id}` ? 'Sharing...' : 'Share'}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(file.id, file.originalName)}
                  disabled={processingFile === `delete-${file.id}`}
                  className="text-red-600 hover:text-red-900"
                >
                  {processingFile === `delete-${file.id}` ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
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