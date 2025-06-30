import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Debug() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/files/debug');
      setResult(response.data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Debug Page</h1>
        <div>
          <Link href="/dashboard" style={{ 
            padding: '8px 16px', 
            background: '#0070f3', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px',
            marginRight: '10px'
          }}>
            Dashboard
          </Link>
          <Link href="/" style={{ 
            padding: '8px 16px', 
            background: '#4CAF50', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}>
            Home
          </Link>
        </div>
      </div>
      
      <button 
        onClick={checkFiles}
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          background: '#ff9800', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Loading...' : 'Check Files in Backend'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>Result:</h2>
          <div style={{ marginBottom: '10px' }}>
            <strong>Total Files: </strong> {result.count}
          </div>
          
          {result.files && result.files.length > 0 ? (
            <div>
              <h3>Files:</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {result.files.map(file => (
                  <li key={file.id} style={{ 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    marginBottom: '10px', 
                    borderRadius: '4px',
                    background: '#f9f9f9'
                  }}>
                    <div><strong>Name:</strong> {file.originalName}</div>
                    <div><strong>ID:</strong> {file.id}</div>
                    <div><strong>Owner ID:</strong> {file.ownerId}</div>
                    <div><strong>Size:</strong> {formatFileSize(file.originalSize)}</div>
                    <div><strong>Created:</strong> {new Date(file.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ color: 'red' }}>No files found in the backend storage</div>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <h3>Raw Response:</h3>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              overflow: 'auto',
              maxHeight: '300px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}