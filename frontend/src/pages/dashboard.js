import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import FileUploader from '../components/FileUploader';
import EnhancedFileUploader from '../components/EnhancedFileUploader';
import FileList from '../components/FileList';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { getFiles } from '../utils/supabaseStorage';
import { getCurrentUser, getCurrentUserId } from '../utils/auth';

export default function Dashboard({ user, loading }) {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [useEnhancedUploader, setUseEnhancedUploader] = useState(true);
  
  // Get current user
  useEffect(() => {
    const loadUser = async () => {
      const authUser = await getCurrentUser();
      setCurrentUser(authUser);
      if (!authUser) {
        router.push('/');
      }
    };
    loadUser();
  }, [router]);
  
  // Load user files
  useEffect(() => {
    if (currentUser) {
      loadUserFiles();
    }
  }, [currentUser]);
  
  const loadUserFiles = async () => {
    try {
      setIsLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('No user ID found');
        setFiles([]);
        return;
      }
      
      const userFiles = await getFiles();
      console.log(`Files loaded for user ${userId}:`, userFiles);
      setFiles(userFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
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
  
  if (loading || !currentUser) {
    return (
      <Layout title="Loading...">
        <div className="container mx-auto p-4 text-center py-16">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Dashboard" user={currentUser}>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {currentUser?.email?.split('@')[0]} 👋
              </h1>
              <p className="text-gray-600">
                Manage and share your files securely
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Enhanced Upload:</span>
                <button
                  onClick={() => setUseEnhancedUploader(!useEnhancedUploader)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useEnhancedUploader ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useEnhancedUploader ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <button 
                onClick={loadUserFiles}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* File Uploader */}
            {useEnhancedUploader ? (
              <EnhancedFileUploader 
                onUploadComplete={handleUploadComplete}
              />
            ) : (
              <div className="bg-gray-50 rounded-lg shadow p-6">
                <FileUploader onUploadComplete={handleUploadComplete} />
              </div>
            )}
            
            {/* File List */}
            {isLoading ? (
              <div className="bg-gray-50 rounded-lg shadow p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-gray-600">Loading your files...</div>
                </div>
              </div>
            ) : (
              <FileList 
                files={files} 
                onFileDeleted={handleFileDeleted} 
                onFileUpdated={handleFileUpdated}
              />
            )}
          </div>
        </div>
        
        {/* Theme Customizer */}
        <ThemeCustomizer />
      </div>
    </Layout>
  );
}