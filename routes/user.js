const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const UploadController = require('../controllers/upload');
const { singleUpload, handleMulterErrors } = require('../middlewares/upload');
const UserController = require('../controllers/user');

router.post('/add' ,authMiddleware.authenticate, UploadController.createUser )
router.get('/getAllProfile',authMiddleware.authenticate,UploadController.getAllprofile)
router.get('/profile', authMiddleware.authenticate, UploadController.getProfile);

router.post( '/upload-profile-picture', authMiddleware.authenticate, singleUpload, handleMulterErrors, UploadController.uploadProfilePicture);

router.delete('/profile-picture', authMiddleware.authenticate,UploadController.deleteProfilePicture);

module.exports = router;