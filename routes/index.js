
const express = require('express');
const router = express.Router();


const authRoutes = require('./auth');
const userRoutes = require('./user');




router.use('/auth', authRoutes);


router.use('/user', userRoutes);


router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});


router.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});


router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router;