const { verifyFirebaseToken, verifySharingToken } = require('../utils/auth');

/**
 * Middleware to authenticate requests using Firebase Auth
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyFirebaseToken(token);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to verify sharing tokens
 */
const verifySharingAccess = (req, res, next) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No sharing token provided' });
    }
    
    const decoded = verifySharingToken(token);
    
    // Add file info to request object
    req.fileAccess = {
      fileId: decoded.fileId,
      userId: decoded.userId
    };
    
    next();
  } catch (error) {
    console.error('Sharing token verification error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired sharing token' });
  }
};

/**
 * Middleware to require admin privileges
 */
const requireAdmin = (req, res, next) => {
  // Simple admin check - in production, check against admin user list
  const adminEmails = ['admin@example.com', 'admin@yourdomain.com'];
  
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  
  next();
};

module.exports = {
  authenticateUser,
  verifySharingAccess,
  requireAdmin
};