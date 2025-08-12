// Simple audit logging middleware
const auditLogs = [];

const logAction = (action, userId, details = {}, req = {}) => {
  const logEntry = {
    id: Date.now().toString(),
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers?.['user-agent'] || 'unknown'
  };
  
  auditLogs.push(logEntry);
  console.log(`AUDIT: ${action} by ${userId}`, details);
  
  // Keep only last 1000 logs in memory
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }
  
  return logEntry;
};

const getAuditLogs = () => auditLogs;

module.exports = {
  logAction,
  getAuditLogs
};