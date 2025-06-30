import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import { getFiles } from '../utils/supabaseStorage'; // Using Supabase storage

export default function Dashboard({ user, loading }) {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect to home if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  // Load user files
  useEffect(() => {
    if (user) {
      loadUserFiles();
    }
  }, [user]);
  
  const loadUserFiles = async () => {
    try {
      setIsLoading(true);
      const userFiles = await getFiles();
      console.log('Files loaded in dashboard:', userFiles);
      setFiles(userFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file upload completion
  const handleUploadComplete = () => {
    console.log('Upload complete, reloading files...');
    loadUserFiles();
  };
  
  // Handle file deletion
  const handleFileDeleted = (fileId) => {
    if (fileId) {
      setFiles(files.filter(file => file.id !== fileId));
    } else {
      // Refresh all files
      loadUserFiles();
    }
  };
  
  // Handle file updates (like sharing link creation)
  const handleFileUpdated = (fileId, updates) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  };
  
  if (loading || !user) {
    return (
      <Layout title="Loading...">
        <div className="container mx-auto p-4 text-center py-16">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Dashboard" user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Files</h1>
          <div>
            <Link href="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          Using Supabase Storage - Files are stored in the cloud
        </div>
        
        <FileUploader onUploadComplete={handleUploadComplete} />
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Loading your files...</div>
          </div>
        ) : (
          <FileList files={files} onFileDeleted={handleFileDeleted} onFileUpdated={handleFileUpdated} />
        )}
        
        <div className="mt-4">
          <button 
            onClick={loadUserFiles}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh file list
          </button>
        </div>
      </div>
    </Layout>
  );
}