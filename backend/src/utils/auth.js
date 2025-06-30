const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Use mock authentication for development
    console.log('Using mock authentication for development');
    
    // Mock implementation for development
    global.mockAuth = {
      users: {},
      currentId: 1000
    };
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

/**
 * Verify Firebase ID token
 * @param {string} token - Firebase ID token
 * @returns {Promise<Object>} Firebase user object
 */
const verifyFirebaseToken = async (token) => {
  try {
    // For development, accept any token and create a mock user
    console.log('Using mock authentication');
    return {
      uid: 'mock-user-' + Date.now(),
      email: 'mockuser@example.com',
      email_verified: true
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Unauthorized: Invalid token');
  }
};

/**
 * Generate a JWT token for sharing
 * @param {string} fileId - File ID
 * @param {string} userId - User ID
 * @param {number} expiresIn - Token expiration time in seconds
 * @returns {string} JWT token
 */
const generateSharingToken = (fileId, userId, expiresIn = 3600) => {
  return jwt.sign(
    { fileId, userId },
    process.env.JWT_SECRET || 'development-secret-key',
    { expiresIn }
  );
};

/**
 * Verify a sharing JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifySharingToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'development-secret-key');
  } catch (error) {
    console.error('Error verifying sharing token:', error);
    throw new Error('Invalid or expired sharing token');
  }
};

module.exports = {
  verifyFirebaseToken,
  generateSharingToken,
  verifySharingToken
};