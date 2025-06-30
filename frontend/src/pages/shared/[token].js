import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSharedFile, trackDownload } from '../../utils/supabaseStorage'; // Using Supabase storage

export default function SharedFile() {
  const router = useRouter();
  const { token } = router.query;
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fetchFile = async (pwd = null) => {
    try {
      setLoading(true);
      setPasswordError('');
      const fileData = await getSharedFile(token, pwd);
      
      if (!fileData) {
        setError("This sharing link is invalid or has expired");
      } else if (fileData.requiresPassword) {
        setRequiresPassword(true);
      } else if (fileData.invalidPassword) {
        setPasswordError('Incorrect password');
      } else if (fileData.limitReached) {
        setError('Download limit reached for this file');
      } else {
        setFile(fileData);
        setRequiresPassword(false);
      }
    } catch (err) {
      console.error('Error fetching shared file:', err);
      setError("Failed to load the shared file. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchFile();
  }, [token]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }
    fetchFile(password);
  };

  const handleDownload = async () => {
    if (!file || !file.downloadURL) {
      setError("Download link is not available");
      return;
    }
    
    // Track download and check limits
    const trackResult = await trackDownload(token);
    
    if (trackResult && trackResult.limitReached) {
      setError('Download limit has been reached for this file');
      return;
    }
    
    if (!trackResult || !trackResult.success) {
      setError('Unable to process download. Please try again.');
      return;
    }
    
    setDownloadStarted(true);
    
    try {
      // Fetch the file as blob
      const response = await fetch(file.downloadURL);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      
      // Create blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      setError('Download failed. Please try again.');
      setDownloadStarted(false);
    }
  };

  const handlePreview = () => {
    if (!file || !file.downloadURL) {
      setError("Preview link is not available");
      return;
    }
    
    // Open in new tab for preview (without download attribute)
    window.open(file.downloadURL, '_blank');
  };

  const canPreview = (fileType) => {
    const previewableTypes = [
      'image/', 'text/', 'application/pdf', 
      'video/', 'audio/', 'application/json'
    ];
    return previewableTypes.some(type => fileType.startsWith(type));
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Loading shared file...</h1>
        <div style={{ marginTop: '20px' }}>Please wait while we retrieve the file information.</div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ 
          padding: '30px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h1>🔒 Password Required</h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            This file is password protected. Please enter the password to access it.
          </p>
          
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              autoFocus
            />
            {passwordError && (
              <div style={{ color: 'red', marginBottom: '10px', fontSize: '0.9rem' }}>
                {passwordError}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Verifying...' : 'Access File'}
            </button>
          </form>
          
          <div style={{ marginTop: '20px' }}>
            <Link href="/" style={{ 
              padding: '8px 16px', 
              background: '#0070f3', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '4px' 
            }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Error</h1>
        <div style={{ color: 'red', marginTop: '20px' }}>{error || "File not found"}</div>
        <Link href="/" style={{ 
          display: 'inline-block',
          marginTop: '20px',
          padding: '8px 16px', 
          background: '#0070f3', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '4px' 
        }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center'
      }}>
        <h1>Shared File</h1>
        
        <div style={{ 
          padding: '20px',
          margin: '20px 0',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
            {file.originalName}
          </div>
          
          <div style={{ color: '#666', marginBottom: '5px' }}>
            Type: {file.originalType}
          </div>
          
          <div style={{ color: '#666', marginBottom: '5px' }}>
            Size: {formatFileSize(file.originalSize)}
          </div>
          
          <div style={{ color: '#666', marginBottom: '15px' }}>
            {file.ownerEmail && `Shared by: ${file.ownerEmail}`}
          </div>
          
          {downloadStarted ? (
            <div style={{ color: 'green', marginBottom: '15px' }}>
              Download started! If it doesn't begin automatically, 
              <a 
                href={file.downloadURL} 
                download={file.originalName}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0070f3', marginLeft: '5px' }}
              >
                click here
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleDownload}
                disabled={downloadStarted}
                style={{ 
                  padding: '10px 20px', 
                  background: downloadStarted ? '#ccc' : '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: downloadStarted ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {downloadStarted ? 'Downloading...' : '📥 Download'}
              </button>
              {canPreview(file.originalType) && file.sharingLink.allowPreview !== false && (
                <button
                  onClick={handlePreview}
                  style={{ 
                    padding: '10px 20px', 
                    background: '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  👁️ Preview
                </button>
              )}
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
          {file.sharingLink.expiresAt ? 
            `This link will expire on ${new Date(file.sharingLink.expiresAt).toLocaleString()}` :
            'This link never expires'
          }
        </div>
        
        {file.sharingLink.hasPassword && (
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#ff9800' }}>
            🔒 This file was password protected
          </div>
        )}
        
        {file.sharingLink.maxDownloads && (
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#2196F3' }}>
            📊 Downloads: {file.sharingLink.downloadCount || 0}/{file.sharingLink.maxDownloads}
          </div>
        )}
        
        {file.sharingLink.allowPreview === false && (
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            🚫 Preview disabled by owner
          </div>
        )}
        
        <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', backgroundColor: '#e6f7ff', padding: '8px', borderRadius: '4px' }}>
          Files are stored securely in Supabase Storage
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <Link href="/" style={{ 
            padding: '8px 16px', 
            background: '#0070f3', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}>
            Back to Home
          </Link>
        </div>
      </div>
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