const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto'); 


const UPLOAD_DIR = path.join(__dirname, '../public/uploads/profile-pictures');
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


function generateRandomString(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}


async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory ready: ${UPLOAD_DIR}`);
  } catch (err) {
    console.error('Upload directory creation failed:', err);
    throw err;
  }
}


ensureUploadDir().catch(err => {
  console.error('Critical upload directory error');
  process.exit(1);
});

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadDir();
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomString = generateRandomString(8);
    const filename = `user-${req.userId}-${Date.now()}-${randomString}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
    error.code = 'LIMIT_FILE_TYPES';
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

const handleMulterErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_TYPES') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Field name must be "profilePicture"'
      });
    }
  }
  next(err);
};

module.exports = {
  singleUpload: upload.single('profilePicture'),
  handleMulterErrors
};