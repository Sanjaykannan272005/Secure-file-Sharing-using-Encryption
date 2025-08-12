const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticateUser, verifySharingAccess } = require('../middleware/auth');
const fileModel = require('../models/file');

// Debug route - no authentication required
router.get('/debug', (req, res) => {
  try {
    const allFiles = fileModel.getAllFiles();
    res.json({
      count: allFiles.length,
      files: allFiles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes (require authentication)
router.post('/upload', authenticateUser, fileController.upload.single('file'), fileController.uploadFile);
router.get('/', authenticateUser, fileController.getUserFiles);
router.get('/:fileId', authenticateUser, fileController.getFileById);
router.delete('/:fileId', authenticateUser, fileController.deleteFile);
router.post('/:fileId/share', authenticateUser, fileController.shareFile);

// Sharing routes
router.get('/shared/:token', verifySharingAccess, fileController.getSharedFile);
router.get('/download/:fileId', (req, res, next) => {
  // Check for token in query params for preview
  if (req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  authenticateUser(req, res, next);
}, fileController.downloadFile);
router.get('/shared/download/:token', verifySharingAccess, fileController.downloadSharedFile);
router.post('/share-email', fileController.shareByEmail);

module.exports = router;