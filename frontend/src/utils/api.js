import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // For development, add a mock token if no user is logged in
      config.headers.Authorization = 'Bearer mock-token';
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    // For development, add a mock token if there's an error
    config.headers.Authorization = 'Bearer mock-token';
  }
  
  return config;
});

/**
 * Upload an encrypted file to the server
 * @param {Object} encryptedFileData - The encrypted file data
 * @param {Object} metadata - File metadata
 * @returns {Promise<Object>} The server response
 */
export const uploadEncryptedFile = async (encryptedFileData, metadata) => {
  try {
    console.log('Uploading encrypted file:', metadata.originalName);
    
    // Create a blob from the encrypted data
    const encryptedBlob = new Blob([encryptedFileData], { type: 'application/octet-stream' });
    
    // Add the encrypted file to the form data
    const formData = new FormData();
    formData.append('file', encryptedBlob, metadata.originalName + '.encrypted');
    
    // Add metadata (excluding the encryption key)
    formData.append('metadata', JSON.stringify({
      originalName: metadata.originalName,
      originalType: metadata.originalType,
      originalSize: metadata.originalSize,
    }));
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Error in uploadEncryptedFile:', error);
    throw error;
  }
};

/**
 * Get a list of files uploaded by the current user
 * @returns {Promise<Array>} Array of file objects
 */
export const getUserFiles = async () => {
  try {
    console.log('Fetching user files...');
    const response = await axios.get(`${API_URL}/files`, {
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    });
    console.log('Files received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getUserFiles:', error);
    return [];
  }
};

/**
 * Generate a temporary sharing link for a file
 * @param {string} fileId - The ID of the file to share
 * @param {number} expirationHours - Hours until the link expires
 * @returns {Promise<Object>} Object containing the sharing URL
 */
export const generateSharingLink = async (fileId, expirationHours = 24) => {
  const response = await api.post(`/files/${fileId}/share`, {
    expirationHours,
  });
  return response.data;
};

/**
 * Get file information by its ID
 * @param {string} fileId - The ID of the file
 * @returns {Promise<Object>} File object
 */
export const getFileById = async (fileId) => {
  const response = await api.get(`/files/${fileId}`);
  return response.data;
};

/**
 * Delete a file by its ID
 * @param {string} fileId - The ID of the file to delete
 * @returns {Promise<Object>} Response object
 */
export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

export default api;