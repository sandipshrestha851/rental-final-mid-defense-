const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { tokenRequired } = require('../middleware/authMiddleware');
const propertyController = require('../controllers/propertyController');
const imageController = require('../controllers/imageController');

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/properties'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});
const upload = multer({ storage });

// Public endpoints — MUST come before /properties/:id to avoid route capture
router.get('/properties/search', propertyController.searchProperties);
router.get('/properties/active', propertyController.getActiveProperties);
router.get('/properties/active/:id', propertyController.getActivePropertyById);
router.get('/properties/active/:id/similar', propertyController.getSimilarProperties);
router.get('/properties/active/:id/share', propertyController.getShareInfo);
router.get('/properties/active/:id/images', propertyController.getPropertyImages);

// View tracking
router.post('/properties/:id/view', tokenRequired, propertyController.trackView);

// Landlord property CRUD — parameterized :id routes go after static routes
router.get('/properties', tokenRequired, propertyController.getMyProperties);
router.post('/properties', tokenRequired, propertyController.createProperty);
router.get('/properties/:id', tokenRequired, propertyController.getPropertyById);
router.put('/properties/:id', tokenRequired, propertyController.updateProperty);
router.put('/properties/:id/status', tokenRequired, propertyController.updatePropertyStatus);
router.delete('/properties/:id', tokenRequired, propertyController.deleteProperty);

// Image upload
router.post('/properties/:id/images', tokenRequired, upload.array('images', 10), imageController.uploadImages);
router.put('/properties/:id/images/order', tokenRequired, imageController.updateImageOrder);
router.delete('/properties/images/:imageId', tokenRequired, imageController.deleteImage);

// Admin property routes
router.get('/admin/properties', tokenRequired, propertyController.getAllProperties);
router.put('/admin/properties/:id/status', tokenRequired, propertyController.adminUpdatePropertyStatus);

module.exports = router;
