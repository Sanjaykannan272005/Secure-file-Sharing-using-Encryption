/**
 * File model
 * 
 * Note: In a production application, this would typically be a database model.
 * For simplicity, we're using an in-memory store here.
 * In a real application, you would use a database like MongoDB, PostgreSQL, etc.
 */

// In-memory file store
const fileStore = new Map();

// Debug function to log the current state of the file store
const debugFileStore = () => {
  console.log('Current files in store:', Array.from(fileStore.values()));
  return Array.from(fileStore.values());
};

/**
 * Create a new file record
 * @param {Object} fileData - File data object
 * @returns {Object} Created file object
 */
const createFile = (fileData) => {
  const file = {
    id: fileData.id,
    path: fileData.path,
    originalName: fileData.originalName,
    originalType: fileData.originalType,
    originalSize: fileData.originalSize,
    ownerId: fileData.ownerId,
    ownerEmail: fileData.ownerEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  fileStore.set(file.id, file);
  console.log(`File created and stored with ID: ${file.id}`);
  return file;
};

/**
 * Get a file by ID
 * @param {string} fileId - File ID
 * @returns {Object|null} File object or null if not found
 */
const getFileById = (fileId) => {
  return fileStore.get(fileId) || null;
};

/**
 * Get files by owner ID
 * @param {string} ownerId - Owner user ID
 * @returns {Array} Array of file objects
 */
const getFilesByOwnerId = (ownerId) => {
  console.log(`Getting files for owner: ${ownerId}`);
  console.log(`Total files in store: ${fileStore.size}`);
  
  const files = Array.from(fileStore.values())
    .filter(file => file.ownerId === ownerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  console.log(`Found ${files.length} files for owner ${ownerId}`);
  return files;
};

/**
 * Get all files (for debugging)
 * @returns {Array} Array of all file objects
 */
const getAllFiles = () => {
  return Array.from(fileStore.values());
};

/**
 * Update a file record
 * @param {string} fileId - File ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated file object or null if not found
 */
const updateFile = (fileId, updateData) => {
  const file = fileStore.get(fileId);
  
  if (!file) {
    return null;
  }
  
  const updatedFile = {
    ...file,
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  fileStore.set(fileId, updatedFile);
  return updatedFile;
};

/**
 * Delete a file record
 * @param {string} fileId - File ID
 * @returns {boolean} True if deleted, false if not found
 */
const deleteFile = (fileId) => {
  return fileStore.delete(fileId);
};

/**
 * Create a sharing record for a file
 * @param {string} fileId - File ID
 * @param {string} token - Sharing token
 * @param {Date} expiresAt - Expiration date
 * @returns {Object} Sharing record
 */
const createFileSharing = (fileId, token, expiresAt) => {
  const file = fileStore.get(fileId);
  
  if (!file) {
    return null;
  }
  
  // Add sharing info to file
  const updatedFile = {
    ...file,
    sharing: {
      token,
      expiresAt: expiresAt.toISOString()
    },
    updatedAt: new Date().toISOString()
  };
  
  fileStore.set(fileId, updatedFile);
  return updatedFile;
};

module.exports = {
  createFile,
  getFileById,
  getFilesByOwnerId,
  updateFile,
  deleteFile,
  createFileSharing,
  debugFileStore,
  getAllFiles
};