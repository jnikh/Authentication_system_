const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

router.post('/initiate-otp', AuthController.initiateOTPLogin);
router.post('/verify-otp', AuthController.verifyOTPAndLogin);
router.post('/refresh-token', authMiddleware.checkRefreshToken, AuthController.refreshToken);
router.post('/logout', AuthController.logout);

module.exports = router;