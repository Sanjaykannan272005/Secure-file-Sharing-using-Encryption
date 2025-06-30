// Mock in-memory storage
export const mockFiles = [];

// Simple ID generator
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 10);
};

// Generate a sharing token
export const generateSharingToken = (fileId) => {
  return `share-${fileId}-${Math.random().toString(36).substring(2, 10)}`;
};

// Mock file upload with progress tracking
export const uploadFile = (file, metadata, onProgress = () => {}) => {
  return new Promise((resolve) => {
    const fileId = generateId();
    const newFile = {
      id: fileId,
      originalName: metadata.originalName || file.name,
      originalType: metadata.originalType || file.type,
      originalSize: metadata.originalSize || file.size,
      createdAt: new Date().toISOString(),
      sharingLink: null,
      // Create a mock download URL
      downloadURL: `https://mock-storage.example.com/files/${fileId}/${encodeURIComponent(metadata.originalName || file.name)}`
    };
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        mockFiles.push(newFile);
        resolve({ id: fileId, ...newFile });
      }
    }, 300);
  });
};

export const getFiles = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockFiles]);
    }, 500);
  });
};

export const createSharingLink = (fileId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const fileIndex = mockFiles.findIndex(file => file.id === fileId);
      
      if (fileIndex === -1) {
        reject(new Error('File not found'));
        return;
      }
      
      const sharingToken = generateSharingToken(fileId);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration
      
      const sharingLink = {
        token: sharingToken,
        url: `/shared/${sharingToken}`,
        expiresAt: expiresAt.toISOString()
      };
      
      // Update the file with the sharing link
      mockFiles[fileIndex] = {
        ...mockFiles[fileIndex],
        sharingLink
      };
      
      resolve(sharingLink);
    }, 500);
  });
};

// Get shared file by token
export const getSharedFile = async (token) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!token) {
        resolve(null);
        return;
      }
      
      const fileId = token.split('-')[1];
      if (!fileId) {
        resolve(null);
        return;
      }
      
      const file = mockFiles.find(f => f.id === fileId);
      
      if (!file || !file.sharingLink || file.sharingLink.token !== token) {
        resolve(null);
        return;
      }
      
      // Check if link has expired
      if (new Date(file.sharingLink.expiresAt) < new Date()) {
        resolve(null);
        return;
      }
      
      resolve(file);
    }, 500);
  });
};