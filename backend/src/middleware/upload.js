const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { errorResponse } = require('../utils/apiResponse');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/profile-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with unique, secure filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const randomHex = crypto.randomBytes(6).toString('hex');
    const userId = req.user?._id ? req.user._id.toString() : 'user';
    const filename = `${userId}-${Date.now()}-${randomHex}${ext}`;
    cb(null, filename);
  },
});

// File filter for allowed image formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error('Please select a JPG, PNG, or WEBP image under 5MB.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

// 5MB max file size
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

/**
 * Middleware wrapper for handling multer uploads with clean error responses
 */
const uploadProfileImageMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(
            res,
            'Please select a JPG, PNG, or WEBP image under 5MB.',
            400
          );
        }
        return errorResponse(res, err.message, 400);
      }
      return errorResponse(
        res,
        err.message || 'Please select a JPG, PNG, or WEBP image under 5MB.',
        400
      );
    }

    // Normalize req.file from multer fields
    if (req.files) {
      req.file =
        req.files.profilePicture?.[0] ||
        req.files.avatar?.[0] ||
        req.files.image?.[0] ||
        null;
    }

    next();
  });
};

module.exports = {
  uploadProfileImageMiddleware,
  uploadDir,
};
