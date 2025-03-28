const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authMiddleware = {
  // Verify access token
  authenticate: (req, res, next) => {
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Access token missing' });
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
  },

  // Check if refresh token is available
  checkRefreshToken: (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  }
};

module.exports = authMiddleware;