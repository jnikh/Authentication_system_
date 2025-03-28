// controllers/upload.js
const path = require('path');
const User = require('../models/User');
const { count } = require('console');
const fs = require('fs').promises;

class UploadController {
  /**
   * Upload profile picture
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllprofile(req, res) {
    try {
      const user = await User.findAll();
      res.status(200).json({
        success:true,
        count:user.length,
        data:user
      })
      console.log(user)
    } catch (error) {
      res.status(500).json({
        success:false,
        message:'failed to load every data'
      })
    }
  }
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  static async createUser(req, res) {
        try {
          const { phone, name } = req.body;
          
          const newUser = await User.create({ phone, name });
          
          res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser
          });
        } catch (error) {
          console.error('Error creating user:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
          });
        }
        }

  static async uploadProfilePicture(req, res) {
    let tempFilePath = null;
    
    try {
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'No file uploaded' 
        });
      }
      
      tempFilePath = req.file.path;

     
      const user = await User.findById(req.userId);
      if (!user) {
        await fs.unlink(tempFilePath);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      
      const { originalname, mimetype, size } = req.file;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; 
      
      if (!allowedTypes.includes(mimetype)) {
        await fs.unlink(tempFilePath);
        return res.status(400).json({
          success: false,
          message: 'Only JPG, PNG, GIF or WEBP images are allowed'
        });
      }

      if (size > maxSize) {
        await fs.unlink(tempFilePath);
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit'
        });
      }

     
      const uploadDir = path.join(__dirname, '../../public/uploads/profile-pictures');
      await fs.mkdir(uploadDir, { recursive: true });
      
      const fileExt = path.extname(originalname);
      const newFilename = `user-${req.userId}-${Date.now()}${fileExt}`;
      const newPath = path.join(uploadDir, newFilename);
      const publicUrl = `/uploads/profile-pictures/${newFilename}`;

      
      await fs.rename(tempFilePath, newPath);
      tempFilePath = null; 

     
      await User.updateProfilePicture(req.userId, publicUrl);

     
      if (user.profile_picture) {
        const oldPath = path.join(__dirname, '../../public', user.profile_picture);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }

      
      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: {
          url: publicUrl,
          mimetype,
          size
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      
      if (tempFilePath) {
        try {
          await fs.unlink(tempFilePath);
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete profile picture
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteProfilePicture(req, res) {
    try {
      const user = await User.findById(req.userId);
      
      if (!user || !user.profile_picture) {
        return res.status(400).json({
          success: false,
          message: 'No profile picture to delete'
        });
      }

      const imagePath = path.join(
        __dirname,
        '../../public',
        user.profile_picture
      );

      
      await fs.unlink(imagePath).catch(err => {
        console.error('File deletion error:', err);
      });

      
      await User.updateProfilePicture(req.userId, null);

      res.status(200).json({
        success: true,
        message: 'Profile picture deleted successfully'
      });

    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete profile picture',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = UploadController;