const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const OTP = require('../models/OTP');  
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

class AuthController {
  
  static async initiateOTPLogin(req, res) {
    try {
      const { phone } = req.body;
      console.log('Searching for phone:', phone);

     
      console.log('User model:', User ? 'Loaded' : 'Undefined');
      console.log('OTP model:', OTP ? 'Loaded' : 'Undefined');

      const user = await User.findByPhone(phone);
      console.log('User found:', user);

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

      
      console.log('Storing OTP in database...');
      await OTP.create(phone, otp, expiresAt);

      
      console.log(`OTP for ${phone}: ${otp}`);

      
      res.status(200).json({ 
        success: true,
        message: 'OTP sent successfully',
        otp: otp 
      });
      
    } catch (error) {
      console.error('Error in initiateOTPLogin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate OTP',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

 
  static async verifyOTPAndLogin(req, res) {
    try {
      const { phone, otp } = req.body;

      
      console.log('Verifying OTP for:', phone);
      const validOTP = await OTP.findValidOTP(phone, otp);
      if (!validOTP) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid or expired OTP' 
        });
      }

     
      const user = await User.findByPhone(phone);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      
      const accessToken = jwt.sign(
        { userId: user.id },
        jwtConfig.accessTokenSecret,
        { expiresIn: jwtConfig.accessTokenExpiry }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        jwtConfig.refreshTokenSecret,
        { expiresIn: jwtConfig.refreshTokenExpiry }
      );

     
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 50 * 60 * 1000 
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

     
      await OTP.delete(phone);

      res.status(200).json({ 
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error in verifyOTPAndLogin:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  
  static async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ 
          success: false,
          message: 'Refresh token missing' 
        });
      }

      const decoded = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret);
      
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        jwtConfig.accessTokenSecret,
        { expiresIn: jwtConfig.accessTokenExpiry }
      );

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 50 * 60 * 1000 
      });

      res.status(200).json({ 
        success: true,
        message: 'Access token refreshed' 
      });
    } catch (error) {
      console.error('Error in refreshToken:', error);
      res.status(403).json({ 
        success: false,
        message: 'Invalid refresh token' 
      });
    }
  }


  static async logout(req, res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  }
}

module.exports = AuthController;