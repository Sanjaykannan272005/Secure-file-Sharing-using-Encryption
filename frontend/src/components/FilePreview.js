import { getCurrentUser } from '../utils/auth';

export default function FilePreview({ file, isOpen, onClose }) {
  if (!isOpen || !file) return null;

  const handlePreview = () => {
    // Use the direct Supabase download URL like shared links do
    const previewUrl = file.downloadURL;
    console.log('Preview URL:', previewUrl, 'File:', file);
    
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    } else {
      console.error('No download URL found for file');
    }
    onClose();
  };

  const canPreview = (fileType) => {
    const previewableTypes = [
      'image/', 'text/', 'application/pdf', 
      'video/', 'audio/', 'application/json'
    ];
    return previewableTypes.some(type => fileType?.startsWith(type));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">{file.originalName}</h3>
        
        <div className="text-4xl mb-4">
          {file.originalType?.startsWith('image/') ? '🖼️' :
           file.originalType?.startsWith('video/') ? '🎥' :
           file.originalType?.includes('pdf') ? '📕' :
           file.originalType?.startsWith('text/') ? '📄' : '📎'}
        </div>
        
        <p className="text-gray-600 mb-6">
          {file.originalType} • {formatFileSize(file.originalSize)}
        </p>
        
        {canPreview(file.originalType) ? (
          <div className="space-y-3">
            <button
              onClick={handlePreview}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              👁️ Open Preview
            </button>
            <p className="text-sm text-gray-500">File will open in a new tab</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500">Preview not available for this file type</p>
            <a
              href={file.downloadURL}
              download={file.originalName}
              target="_blank"
              className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              📥 Download File
            </a>
          </div>
        )}
        
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}