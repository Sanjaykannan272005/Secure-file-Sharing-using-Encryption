const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLog');

// Shared download logs storage - use global store
if (!global.downloadLogs) {
  global.downloadLogs = [];
}
const downloadLogs = global.downloadLogs;

// Log download activity
const logDownload = (fileId, fileName, fileSize, fileType, ownerId, ownerEmail, shareToken, req) => {
  const logEntry = {
    id: Date.now().toString(),
    fileId,
    fileName,
    fileSize,
    fileType,
    ownerId,
    ownerEmail,
    shareToken,
    ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
    userAgent: req.headers['user-agent'] || 'Unknown',
    downloadTime: new Date().toISOString(),
    country: getCountryFromIP(req.ip),
    city: getCityFromIP(req.ip)
  };
  
  downloadLogs.push(logEntry);
  
  // Keep only last 10000 logs in memory
  if (downloadLogs.length > 10000) {
    downloadLogs.shift();
  }
  
  return logEntry;
};

// Mock geolocation functions (replace with actual IP geolocation service)
const getCountryFromIP = (ip) => {
  const mockCountries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia'];
  return mockCountries[Math.floor(Math.random() * mockCountries.length)];
};

const getCityFromIP = (ip) => {
  const mockCities = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto'];
  return mockCities[Math.floor(Math.random() * mockCities.length)];
};

// Get download logs with filtering
router.get('/', authenticateUser, requireAdmin, (req, res) => {
  try {
    const { dateFrom, dateTo, fileName, ipAddress, userEmail } = req.query;
    
    let filteredLogs = [...downloadLogs];
    
    // Apply filters
    if (dateFrom) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.downloadTime) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.downloadTime) <= new Date(dateTo + 'T23:59:59')
      );
    }
    
    if (fileName) {
      filteredLogs = filteredLogs.filter(log => 
        log.fileName.toLowerCase().includes(fileName.toLowerCase())
      );
    }
    
    if (ipAddress) {
      filteredLogs = filteredLogs.filter(log => 
        log.ipAddress.includes(ipAddress)
      );
    }
    
    if (userEmail) {
      filteredLogs = filteredLogs.filter(log => 
        log.ownerEmail.toLowerCase().includes(userEmail.toLowerCase())
      );
    }
    
    // Sort by most recent first
    filteredLogs.sort((a, b) => new Date(b.downloadTime) - new Date(a.downloadTime));
    
    res.json(filteredLogs);
  } catch (error) {
    console.error('Error getting download logs:', error);
    res.status(500).json({ error: 'Failed to get download logs' });
  }
});

// Export download logs as CSV
router.get('/export', authenticateUser, requireAdmin, (req, res) => {
  try {
    const csvHeader = 'Date,Time,File Name,File Owner,IP Address,User Agent,File Size,Share Token,Country,City\n';
    
    const csvData = downloadLogs.map(log => {
      const date = new Date(log.downloadTime);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        `"${log.fileName}"`,
        log.ownerEmail,
        log.ipAddress,
        `"${log.userAgent}"`,
        log.fileSize,
        log.shareToken?.substring(0, 10) + '...',
        log.country,
        log.city
      ].join(',');
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="download-logs.csv"');
    res.send(csvHeader + csvData);
    
    logAction('LOGS_EXPORTED', req.user.uid, { type: 'download_logs' }, req);
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

// Get download statistics
router.get('/stats', authenticateUser, requireAdmin, (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: downloadLogs.length,
      today: downloadLogs.filter(log => new Date(log.downloadTime) >= today).length,
      thisWeek: downloadLogs.filter(log => new Date(log.downloadTime) >= thisWeek).length,
      thisMonth: downloadLogs.filter(log => new Date(log.downloadTime) >= thisMonth).length,
      uniqueFiles: new Set(downloadLogs.map(log => log.fileId)).size,
      uniqueIPs: new Set(downloadLogs.map(log => log.ipAddress)).size,
      topFiles: getTopFiles(),
      topCountries: getTopCountries(),
      hourlyDistribution: getHourlyDistribution()
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting download stats:', error);
    res.status(500).json({ error: 'Failed to get download stats' });
  }
});

// Helper functions for statistics
const getTopFiles = () => {
  const fileCounts = {};
  downloadLogs.forEach(log => {
    fileCounts[log.fileName] = (fileCounts[log.fileName] || 0) + 1;
  });
  
  return Object.entries(fileCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([fileName, count]) => ({ fileName, count }));
};

const getTopCountries = () => {
  const countryCounts = {};
  downloadLogs.forEach(log => {
    countryCounts[log.country] = (countryCounts[log.country] || 0) + 1;
  });
  
  return Object.entries(countryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));
};

const getHourlyDistribution = () => {
  const hourCounts = Array(24).fill(0);
  downloadLogs.forEach(log => {
    const hour = new Date(log.downloadTime).getHours();
    hourCounts[hour]++;
  });
  
  return hourCounts.map((count, hour) => ({ hour, count }));
};

// Add some mock data for demonstration
const addMockDownloadLogs = () => {
  const mockFiles = [
    { name: 'document.pdf', size: 2048000, type: 'application/pdf' },
    { name: 'image.jpg', size: 1024000, type: 'image/jpeg' },
    { name: 'presentation.pptx', size: 5120000, type: 'application/vnd.ms-powerpoint' },
    { name: 'data.xlsx', size: 3072000, type: 'application/vnd.ms-excel' }
  ];
  
  const mockUsers = [
    { id: 'user1', email: 'john@example.com' },
    { id: 'user2', email: 'jane@example.com' },
    { id: 'user3', email: 'bob@example.com' }
  ];
  
  // Generate 50 mock download logs
  for (let i = 0; i < 50; i++) {
    const file = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    downloadLogs.push({
      id: `mock-${i}`,
      fileId: `file-${i}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      ownerId: user.id,
      ownerEmail: user.email,
      shareToken: `share-token-${i}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      downloadTime: date.toISOString(),
      country: getCountryFromIP(),
      city: getCityFromIP()
    });
  }
};

// Initialize with mock data
addMockDownloadLogs();

module.exports = {
  router,
  logDownload
};