const express = require('express');
const router = express.Router();

// Basic admin route placeholder
router.get('/status', (req, res) => {
  res.json({ message: 'Admin routes active' });
});

module.exports = router;