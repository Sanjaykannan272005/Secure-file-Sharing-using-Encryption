import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { uploadFile } from '../utils/supabaseStorage';

export default function EnhancedFileUploader({ onUploadComplete, currentFolder = null }) {
  const [uploadQueue, setUploadQueue] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Drag handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
      setIsDragOver(true);
    } else if (e.type === "dragleave") {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  // File processing
  const handleFiles = useCallback(async (files) => {
    const newUploads = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'queued', // queued, uploading, paused, completed, error
      error: null
    }));

    setUploadQueue(prev => [...prev, ...newUploads]);
    
    // Start uploading
    for (const upload of newUploads) {
      await processUpload(upload);
    }
  }, []);

  const processUpload = async (uploadItem) => {
    try {
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadItem.id 
          ? { ...item, status: 'uploading' }
          : item
      ));

      await uploadFile(
        uploadItem.file,
        {
          originalName: uploadItem.file.name,
          originalType: uploadItem.file.type,
          originalSize: uploadItem.file.size,
          folder: currentFolder
        },
        (progress) => {
          setUploadQueue(prev => prev.map(item => 
            item.id === uploadItem.id 
              ? { ...item, progress }
              : item
          ));
        }
      );

      setUploadQueue(prev => prev.map(item => 
        item.id === uploadItem.id 
          ? { ...item, status: 'completed', progress: 100 }
          : item
      ));

      toast.success(`${uploadItem.name} uploaded successfully`);
      
    } catch (error) {
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadItem.id 
          ? { ...item, status: 'error', error: error.message }
          : item
      ));
      toast.error(`Failed to upload ${uploadItem.name}`);
    }
  };

  const pauseUpload = (id) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === id && item.status === 'uploading'
        ? { ...item, status: 'paused' }
        : item
    ));
  };

  const resumeUpload = async (id) => {
    const upload = uploadQueue.find(item => item.id === id);
    if (upload && upload.status === 'paused') {
      await processUpload(upload);
    }
  };

  const removeFromQueue = (id) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
    if (onUploadComplete) onUploadComplete();
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : dragActive 
            ? 'border-blue-400 bg-blue-25' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-6xl">
            {isDragOver ? '📂' : '☁️'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isDragOver ? 'Drop files here!' : 'Drag & Drop Files'}
            </h3>
            <p className="text-gray-500 mt-1">
              Or click to browse files from your device
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              📁 Select Files
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              📂 Select Folder
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Upload Queue ({uploadQueue.length})</h3>
            <button
              onClick={clearCompleted}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Completed
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {uploadQueue.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">
                  {item.status === 'completed' ? '✅' : 
                   item.status === 'error' ? '❌' : 
                   item.status === 'paused' ? '⏸️' : '📄'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {(item.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  
                  {item.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.progress}%</p>
                    </div>
                  )}
                  
                  {item.error && (
                    <p className="text-xs text-red-500 mt-1">{item.error}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  {item.status === 'uploading' && (
                    <button
                      onClick={() => pauseUpload(item.id)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      ⏸️
                    </button>
                  )}
                  {item.status === 'paused' && (
                    <button
                      onClick={() => resumeUpload(item.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ▶️
                    </button>
                  )}
                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}