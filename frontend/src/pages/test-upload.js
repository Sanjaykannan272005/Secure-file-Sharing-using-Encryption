import { useState, useEffect } from 'react';
import Link from 'next/link';
import { uploadFile, getFiles, createSharingLink } from '../utils/mockApi';

export default function FileTest() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [sharingStatus, setSharingStatus] = useState({});

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const files = await getFiles();
      console.log('Files from mock storage:', files);
      setFiles(files);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      setUploadStatus('Uploading...');
      setError(null);
      
      const response = await uploadFile(file, {
        originalName: file.name,
        originalType: file.type,
        originalSize: file.size
      });
      
      setUploadStatus(`File uploaded successfully! ID: ${response.id}`);
      fetchFiles(); // Refresh the file list
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
      setUploadStatus('Upload failed');
    }
  };

  const handleCreateShareLink = async (fileId) => {
    try {
      setSharingStatus(prev => ({ ...prev, [fileId]: 'Creating sharing link...' }));
      
      const sharingLink = await createSharingLink(fileId);
      
      setSharingStatus(prev => ({ 
        ...prev, 
        [fileId]: `Link created! Expires in 24 hours` 
      }));
      
      // Copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/shared/${sharingLink.token}`);
      
      // Refresh the file list to show the sharing link
      fetchFiles();
    } catch (err) {
      console.error('Error creating sharing link:', err);
      setSharingStatus(prev => ({ ...prev, [fileId]: `Error: ${err.message}` }));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>File Test Page</h1>
        <div>
          <Link href="/dashboard" style={{ 
            padding: '8px 16px', 
            background: '#0070f3', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}>
            Dashboard
          </Link>
        </div>
      </div>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        backgroundColor: '#e8f5e9'
      }}>
        <strong>Server Status:</strong> Using mock server (no backend required)
      </div>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
        <h3>Simple File Upload Test (Mock)</h3>
        <input 
          type="file" 
          onChange={handleFileUpload}
          style={{ marginBottom: '10px' }}
        />
        {uploadStatus && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: uploadStatus.includes('failed') ? '#ffebee' : '#e8f5e9',
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            {uploadStatus}
          </div>
        )}
        <p style={{ fontSize: '0.8rem', marginTop: '8px', color: '#666' }}>
          This is using a mock server since the backend is not available
        </p>
      </div>
      
      <button 
        onClick={fetchFiles}
        style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', marginBottom: '20px', cursor: 'pointer' }}
      >
        Refresh Files
      </button>
      
      {loading ? (
        <p>Loading files...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <div>
          <h2>Files ({files.length})</h2>
          {files.length === 0 ? (
            <p>No files found</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {files.map(file => (
                <li key={file.id} style={{ padding: '15px', border: '1px solid #ddd', marginBottom: '15px', borderRadius: '4px' }}>
                  <div><strong>Name:</strong> {file.originalName}</div>
                  <div><strong>ID:</strong> {file.id}</div>
                  <div><strong>Size:</strong> {formatFileSize(file.originalSize)}</div>
                  <div><strong>Created:</strong> {new Date(file.createdAt).toLocaleString()}</div>
                  
                  <div style={{ marginTop: '15px' }}>
                    {file.sharingLink ? (
                      <div style={{ 
                        padding: '10px', 
                        backgroundColor: '#e8f5e9', 
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}>
                        <div><strong>Sharing Link:</strong></div>
                        <div style={{ 
                          padding: '8px', 
                          backgroundColor: '#f5f5f5', 
                          borderRadius: '4px',
                          marginTop: '5px',
                          wordBreak: 'break-all',
                          fontSize: '0.9rem'
                        }}>
                          {`${window.location.origin}/shared/${file.sharingLink.token}`}
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                          Expires: {new Date(file.sharingLink.expiresAt).toLocaleString()}
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/shared/${file.sharingLink.token}`)}
                          style={{ 
                            padding: '4px 8px', 
                            background: '#9c27b0', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '5px',
                            fontSize: '0.9rem'
                          }}
                        >
                          Copy Link
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => handleCreateShareLink(file.id)}
                          style={{ 
                            padding: '8px 12px', 
                            background: '#ff9800', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Create Sharing Link
                        </button>
                        {sharingStatus[file.id] && (
                          <div style={{ 
                            marginTop: '8px',
                            fontSize: '0.9rem',
                            color: sharingStatus[file.id].includes('Error') ? '#f44336' : '#4caf50'
                          }}>
                            {sharingStatus[file.id]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}