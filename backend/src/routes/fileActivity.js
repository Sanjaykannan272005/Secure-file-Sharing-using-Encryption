const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');

// Shared download logs array - use a global store
if (!global.downloadLogs) {
  global.downloadLogs = [];
}
const downloadLogs = global.downloadLogs;

// Add download log entry
const addDownloadLog = (fileData, req) => {
  const logEntry = {
    id: Date.now().toString() + Math.random(),
    fileId: fileData.id,
    fileName: fileData.originalName,
    fileSize: fileData.originalSize,
    fileType: fileData.originalType,
    ownerId: fileData.ownerId,
    ownerEmail: fileData.ownerEmail,
    shareToken: req.params.token || 'direct',
    ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
    userAgent: req.headers['user-agent'] || 'Unknown',
    downloadTime: new Date().toISOString(),
    country: getCountryFromIP(req.ip),
    city: getCityFromIP(req.ip)
  };
  
  downloadLogs.push(logEntry);
  console.log(`Download logged: ${fileData.originalName} by ${fileData.ownerEmail}`);
  
  // Keep only last 5000 logs
  if (downloadLogs.length > 5000) {
    downloadLogs.shift();
  }
  
  return logEntry;
};

// Mock geolocation
const getCountryFromIP = (ip) => {
  const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'India'];
  return countries[Math.floor(Math.random() * countries.length)];
};

const getCityFromIP = (ip) => {
  const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto', 'Mumbai'];
  return cities[Math.floor(Math.random() * cities.length)];
};

// Test endpoint to add a mock download
router.post('/test', authenticateUser, (req, res) => {
  const mockDownload = {
    id: Date.now().toString(),
    fileId: 'test-file',
    fileName: 'test-download.pdf',
    fileSize: 1024000,
    fileType: 'application/pdf',
    ownerId: req.user.uid,
    ownerEmail: req.user.email,
    shareToken: 'test-token',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Test Agent',
    downloadTime: new Date().toISOString(),
    country: 'Test Country',
    city: 'Test City'
  };
  
  downloadLogs.push(mockDownload);
  console.log(`Test download added. Total logs: ${downloadLogs.length}`);
  res.json({ message: 'Test download added', total: downloadLogs.length });
});

// Get user's file download logs
router.get('/', authenticateUser, (req, res) => {
  try {
    const { dateFrom, dateTo, fileName } = req.query;
    const userId = req.user.uid;
    
    console.log(`Getting download logs for user: ${userId}`);
    console.log(`Total logs in memory: ${downloadLogs.length}`);
    
    // Filter logs for current user's files only
    let userDownloads = downloadLogs.filter(log => log.ownerId === userId);
    console.log(`User's downloads found: ${userDownloads.length}`);
    
    // Apply filters
    if (dateFrom) {
      userDownloads = userDownloads.filter(log => 
        new Date(log.downloadTime) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      userDownloads = userDownloads.filter(log => 
        new Date(log.downloadTime) <= new Date(dateTo + 'T23:59:59')
      );
    }
    
    if (fileName) {
      userDownloads = userDownloads.filter(log => 
        log.fileName.toLowerCase().includes(fileName.toLowerCase())
      );
    }
    
    // Sort by most recent first
    userDownloads.sort((a, b) => new Date(b.downloadTime) - new Date(a.downloadTime));
    
    console.log(`Returning ${userDownloads.length} downloads`);
    res.json(userDownloads);
  } catch (error) {
    console.error('Error getting user download logs:', error);
    res.status(500).json({ error: 'Failed to get download logs' });
  }
});

// Add some mock data for current user
const addMockUserDownloads = (userId, userEmail) => {
  const mockFiles = [
    { name: 'my-document.pdf', size: 2048000, type: 'application/pdf' },
    { name: 'vacation-photos.zip', size: 15728640, type: 'application/zip' },
    { name: 'presentation.pptx', size: 5120000, type: 'application/vnd.ms-powerpoint' }
  ];
  
  // Generate 15 mock downloads for this user's files
  for (let i = 0; i < 15; i++) {
    const file = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    const date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    downloadLogs.push({
      id: `user-${userId}-${i}`,
      fileId: `file-${userId}-${i}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      ownerId: userId,
      ownerEmail: userEmail,
      shareToken: `share-${i}`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      ][Math.floor(Math.random() * 3)],
      downloadTime: date.toISOString(),
      country: getCountryFromIP(),
      city: getCityFromIP()
    });
  }
};

// Initialize with some mock data when user makes first request
router.use((req, res, next) => {
  if (req.user && downloadLogs.filter(log => log.ownerId === req.user.uid).length === 0) {
    addMockUserDownloads(req.user.uid, req.user.email);
  }
  next();
});

module.exports = {
  router,
  addDownloadLog
};