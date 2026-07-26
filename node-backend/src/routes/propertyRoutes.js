const { Router } = require('express');
const { tokenRequired } = require('../middleware/authMiddleware');
const propertyController = require('../controllers/propertyController');

const router = Router();

router.get('/properties', tokenRequired, propertyController.getMyProperties);
router.post('/properties', tokenRequired, propertyController.createProperty);
router.put('/properties/:id', tokenRequired, propertyController.updateProperty);
router.delete('/properties/:id', tokenRequired, propertyController.deleteProperty);

// Admin property routes — same /api mount, no landlord_id guard
router.get('/admin/properties', tokenRequired, propertyController.getAllProperties);
router.put('/admin/properties/:id/status', tokenRequired, propertyController.adminUpdatePropertyStatus);

module.exports = router;
