const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../utils/auth');

/**
 * Verify a Firebase token
 * Used for testing authentication
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    const decodedToken = await verifyFirebaseToken(token);
    
    res.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;