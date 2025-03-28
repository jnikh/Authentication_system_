const { User } = require('../models/User');

class UserController {

   
  static async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const imagePath = req.file.path;
      await User.updateProfilePicture(req.userId, imagePath);

      res.status(200).json({ 
        message: 'Profile picture uploaded successfully',
        imagePath: imagePath
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = UserController;