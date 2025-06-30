const { v4: uuidv4 } = require('uuid');

// In-memory storage for development
const fileStorage = new Map();

/**
 * Initialize the storage client
 */
const initializeStorage = async () => {
  console.log('Using in-memory storage for development');
  return true;
};

/**
 * Upload a file to storage
 * @param {Buffer|Stream} fileData - The file data to upload
 * @param {string} fileName - Original file name
 * @param {Object} metadata - File metadata
 * @returns {Promise<Object>} Object containing the file ID and storage path
 */
const uploadFile = async (fileData, fileName, metadata = {}) => {
  const fileId = uuidv4();
  const fileKey = `${fileId}/${fileName}`;
  
  // Store in memory
  fileStorage.set(fileKey, {
    data: fileData,
    metadata
  });
  
  console.log(`File uploaded to memory storage: ${fileKey}`);
  
  return {
    id: fileId,
    path: fileKey
  };
};

/**
 * Generate a pre-signed URL for file download
 * @param {string} fileKey - The file key in storage
 * @param {number} expirationSeconds - URL expiration time in seconds
 * @returns {Promise<string>} The pre-signed URL
 */
const generatePresignedUrl = async (fileKey, expirationSeconds = 3600) => {
  // For development, just return the file key as the URL
  return `/api/files/download/${fileKey}`;
};

/**
 * Get a file from storage
 * @param {string} fileKey - The file key in storage
 * @returns {Promise<Object>} Object containing the file data and metadata
 */
const getFile = async (fileKey) => {
  const file = fileStorage.get(fileKey);
  
  if (!file) {
    throw new Error('File not found');
  }
  
  return {
    data: file.data,
    metadata: file.metadata
  };
};

/**
 * Delete a file from storage
 * @param {string} fileKey - The file key in storage
 * @returns {Promise<void>}
 */
const deleteFile = async (fileKey) => {
  fileStorage.delete(fileKey);
  console.log(`File deleted from memory storage: ${fileKey}`);
};

module.exports = {
  initializeStorage,
  uploadFile,
  generatePresignedUrl,
  getFile,
  deleteFile
};