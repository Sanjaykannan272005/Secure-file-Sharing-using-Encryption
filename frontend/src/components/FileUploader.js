import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { uploadFile } from '../utils/supabaseStorage'; // Using Supabase storage
import { scanFile, getThreatLevel } from '../utils/virusScanner';

export default function FileUploader({ onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanningStatus, setScanningStatus] = useState('');
  const [showThreatWarning, setShowThreatWarning] = useState(null);
  
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      for (const file of acceptedFiles) {
        // Start virus scanning
        setScanningStatus(`Scanning ${file.name} for threats...`);
        setUploadProgress(5);
        
        const scanResult = await scanFile(file);
        const threatLevel = getThreatLevel(scanResult);
        
        setUploadProgress(20);
        setScanningStatus('');
        
        // Handle scan results
        if (!scanResult.isClean) {
          if (threatLevel === 'high') {
            toast.error(`${file.name} blocked - High threat detected`);
            continue; // Skip this file
          } else {
            // Show warning for medium/low threats
            const proceed = await new Promise((resolve) => {
              setShowThreatWarning({
                file: file.name,
                threats: scanResult.threats,
                level: threatLevel,
                onProceed: () => { setShowThreatWarning(null); resolve(true); },
                onCancel: () => { setShowThreatWarning(null); resolve(false); }
              });
            });
            
            if (!proceed) {
              toast.info(`Upload cancelled for ${file.name}`);
              continue;
            }
          }
        } else {
          toast.success(`${file.name} - No threats detected`);
        }
        
        // Upload the file to Supabase Storage with progress tracking
        await uploadFile(
          file, 
          {
            originalName: file.name,
            originalType: file.type,
            originalSize: file.size,
            scanResult: scanResult
          },
          (progress) => {
            setUploadProgress(20 + (progress * 0.8)); // Scale progress from 20-100%
          }
        );
        
        setUploadProgress(100);
        toast.success(`${file.name} uploaded successfully`);
      }
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload file: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxSize: 100 * 1024 * 1024 // 100MB limit
  });
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div>
            {scanningStatus ? (
              <div className="mb-4">
                <p className="mb-2 text-orange-600">🛡️ {scanningStatus}</p>
                <div className="w-full bg-orange-200 rounded-full h-2.5">
                  <div className="bg-orange-600 h-2.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2">Uploading... {Math.round(uploadProgress)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ) : isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag and drop files here, or click to select files</p>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Files are scanned for threats and securely stored in Supabase Storage
      </p>
      
      {/* Threat Warning Modal */}
      {showThreatWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4 text-orange-600">⚠️ Security Warning</h3>
            <p className="mb-4">
              <strong>{showThreatWarning.file}</strong> has potential security issues:
            </p>
            <ul className="list-disc list-inside mb-4 text-sm text-gray-700">
              {showThreatWarning.threats.map((threat, index) => (
                <li key={index}>{threat}</li>
              ))}
            </ul>
            <p className="mb-6 text-sm">
              Threat Level: <span className={`font-bold ${
                showThreatWarning.level === 'medium' ? 'text-orange-600' : 'text-yellow-600'
              }`}>{showThreatWarning.level.toUpperCase()}</span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={showThreatWarning.onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel Upload
              </button>
              <button
                onClick={showThreatWarning.onProceed}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Upload Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}