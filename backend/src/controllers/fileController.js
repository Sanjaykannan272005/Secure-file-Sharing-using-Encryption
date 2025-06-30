const multer = require('multer');
const storage = require('../utils/storage');
const fileModel = require('../models/file');
const { generateSharingToken } = require('../utils/auth');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

/**
 * Upload a file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadFile = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Headers:', req.headers);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files:', req.file ? 'File present' : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // Parse metadata
    let metadata = {};
    try {
      metadata = JSON.parse(req.body.metadata || '{}');
      console.log('Metadata:', metadata);
    } catch (error) {
      console.error('Metadata parsing error:', error);
      return res.status(400).json({ error: 'Invalid metadata format' });
    }
    
    // Upload file to storage
    const fileResult = await storage.uploadFile(
      req.file.buffer,
      req.file.originalname,
      {
        originalName: metadata.originalName || req.file.originalname,
        originalType: metadata.originalType || req.file.mimetype,
        originalSize: metadata.originalSize || req.file.size,
        ownerId: req.user?.uid || 'anonymous'
      }
    );
    
    // Create file record
    const file = fileModel.createFile({
      id: fileResult.id,
      path: fileResult.path,
      originalName: metadata.originalName || req.file.originalname,
      originalType: metadata.originalType || req.file.mimetype,
      originalSize: metadata.originalSize || req.file.size,
      ownerId: req.user?.uid || 'anonymous',
      ownerEmail: req.user?.email || 'anonymous@example.com'
    });
    
    console.log('File uploaded successfully:', file.id);
    
    res.status(201).json({
      id: file.id,
      originalName: file.originalName,
      originalType: file.originalType,
      originalSize: file.originalSize,
      createdAt: file.createdAt
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
};

/**
 * Get files for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserFiles = (req, res) => {
  try {
    const files = fileModel.getFilesByOwnerId(req.user?.uid || 'anonymous');
    
    // Return only necessary data
    const fileList = files.map(file => ({
      id: file.id,
      originalName: file.originalName,
      originalType: file.originalType,
      originalSize: file.originalSize,
      createdAt: file.createdAt,
      sharing: file.sharing
    }));
    
    res.json(fileList);
  } catch (error) {
    console.error('Error getting user files:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
};

/**
 * Get a file by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFileById = (req, res) => {
  try {
    const { fileId } = req.params;
    const file = fileModel.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if user owns the file
    if (file.ownerId !== req.user?.uid && req.user?.uid !== 'anonymous') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      id: file.id,
      originalName: file.originalName,
      originalType: file.originalType,
      originalSize: file.originalSize,
      createdAt: file.createdAt,
      sharing: file.sharing
    });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
};

/**
 * Delete a file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = fileModel.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if user owns the file
    if (file.ownerId !== req.user?.uid && req.user?.uid !== 'anonymous') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete from storage
    await storage.deleteFile(file.path);
    
    // Delete from model
    fileModel.deleteFile(fileId);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

/**
 * Generate a sharing link for a file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const shareFile = (req, res) => {
  try {
    const { fileId } = req.params;
    const { expirationHours = 24, neverExpire = false, customExpiration = null } = req.body;
    
    const file = fileModel.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if user owns the file
    if (file.ownerId !== req.user?.uid && req.user?.uid !== 'anonymous') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Generate expiration date
    let expiresAt = null;
    let tokenExpiration = null;
    
    if (neverExpire) {
      expiresAt = null;
      tokenExpiration = null; // No expiration for JWT
    } else if (customExpiration) {
      expiresAt = new Date(customExpiration);
      tokenExpiration = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    } else {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);
      tokenExpiration = expirationHours * 60 * 60;
    }
    
    // Generate sharing token
    const token = generateSharingToken(
      fileId, 
      req.user?.uid || 'anonymous', 
      tokenExpiration
    );
    
    // Update file with sharing info
    fileModel.createFileSharing(fileId, token, expiresAt);
    
    res.json({
      url: `/api/files/shared/${token}`,
      expiresAt: expiresAt ? expiresAt.toISOString() : null
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({ error: 'Failed to share file' });
  }
};

/**
 * Get a shared file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSharedFile = async (req, res) => {
  try {
    const { fileId } = req.fileAccess;
    const file = fileModel.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if sharing has expired (only if expiresAt is set)
    if (file.sharing && file.sharing.expiresAt && new Date(file.sharing.expiresAt) < new Date()) {
      return res.status(403).json({ error: 'Sharing link has expired' });
    }
    
    res.json({
      id: file.id,
      originalName: file.originalName,
      originalType: file.originalType,
      originalSize: file.originalSize,
      ownerEmail: file.ownerEmail,
      expiresAt: file.sharing?.expiresAt
    });
  } catch (error) {
    console.error('Error getting shared file:', error);
    res.status(500).json({ error: 'Failed to get shared file' });
  }
};

/**
 * Download a file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = fileModel.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if user owns the file or has sharing access
    const hasAccess = file.ownerId === req.user?.uid || 
                     (req.fileAccess && req.fileAccess.fileId === fileId) ||
                     req.user?.uid === 'anonymous';
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get file from storage
    const fileData = await storage.getFile(file.path);
    
    // Set headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    // Send file data
    res.send(fileData.data);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

module.exports = {
  upload,
  uploadFile,
  getUserFiles,
  getFileById,
  deleteFile,
  shareFile,
  getSharedFile,
  downloadFile
};