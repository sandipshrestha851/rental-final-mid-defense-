const { Router } = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { tokenRequired } = require('../middleware/authMiddleware');
const profile = require('../controllers/profileController');

const directory = path.join(__dirname, '../../uploads/avatars');
fs.mkdirSync(directory, { recursive: true });
const upload = multer({ storage: multer.diskStorage({ destination: directory, filename: (req, file, cb) => cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`) }), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) });
const router = Router();
const standardUserOnly = (req, res, next) => req.role === 'admin' ? res.status(403).json({ message: 'Profile management is unavailable for administrator accounts.' }) : next();
router.get('/profile', tokenRequired, standardUserOnly, profile.getProfile);
router.put('/profile', tokenRequired, standardUserOnly, profile.updateProfile);
router.post('/profile/avatar', tokenRequired, standardUserOnly, upload.single('avatar'), profile.uploadAvatar);
router.delete('/profile/avatar', tokenRequired, standardUserOnly, profile.deleteAvatar);
router.put('/profile/change-password', tokenRequired, standardUserOnly, profile.changePassword);
router.delete('/profile', tokenRequired, standardUserOnly, profile.deleteAccount);
module.exports = router;
