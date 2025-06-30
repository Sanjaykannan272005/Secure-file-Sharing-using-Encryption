import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { decryptFile } from '../../utils/encryption';
import api from '../../utils/api';

export default function SharePage() {
  const router = useRouter();
  const { id } = router.query;
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  
  // Get file data from the URL
  useEffect(() => {
    if (!id) return;
    
    const fetchFileData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/files/shared/${id}`);
        setFileData(response.data);
        
        // Check if key is in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const keyParam = urlParams.get('key');
        if (keyParam) {
          setDecryptionKey(keyParam);
        }
      } catch (err) {
        console.error('Error fetching shared file:', err);
        setError('This file link is invalid or has expired');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFileData();
  }, [id]);
  
  const handleDownload = async () => {
    if (!fileData || !decryptionKey) return;
    
    try {
      // Download the encrypted file
      const response = await api.get(`/files/download/${fileData.id}`, {
        responseType: 'text'
      });
      
      // Decrypt the file
      const decryptedBlob = decryptFile(
        response.data,
        decryptionKey,
        fileData.originalType
      );
      
      // Create download link
      const downloadUrl = URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileData.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      toast.success('File decrypted and downloaded successfully');
    } catch (err) {
      console.error('Error downloading or decrypting file:', err);
      toast.error('Failed to decrypt file. The key may be incorrect.');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p>Loading file information...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="btn btn-primary mt-4"
        >
          Go to Homepage
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Download Shared File | Secure File Sharing</title>
      </Head>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">Download Shared File</h1>
          
          {fileData && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">{fileData.originalName}</h2>
              <p className="text-gray-600 text-sm mb-1">
                Size: {formatFileSize(fileData.originalSize)}
              </p>
              <p className="text-gray-600 text-sm">
                Shared by: {fileData.ownerEmail || 'Anonymous'}
              </p>
              
              {fileData.expiresAt && (
                <p className="text-gray-600 text-sm mt-2">
                  Link expires: {new Date(fileData.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Decryption Key
            </label>
            <input
              type="text"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              placeholder="Enter the decryption key"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-gray-600 text-xs mt-1">
              You need the decryption key to access this file
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              disabled={!decryptionKey}
              className={`btn ${
                decryptionKey ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'
              }`}
            >
              Download and Decrypt
            </button>
          </div>
        </div>
      </main>
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