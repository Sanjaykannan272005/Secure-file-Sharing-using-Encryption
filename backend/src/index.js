require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const fileRoutes = require('./routes/files');
const authRoutes = require('./routes/auth');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Secure File Sharing API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.statusCode || 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize storage
  const storage = require('./utils/storage');
  storage.initializeStorage()
    .then(() => {
      console.log('Storage initialized successfully');
    })
    .catch(err => {
      console.error('Failed to initialize storage:', err);
    });
});

module.exports = app; // For testing