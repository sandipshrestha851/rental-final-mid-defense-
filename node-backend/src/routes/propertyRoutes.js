const { Router } = require('express');
const { tokenRequired } = require('../middleware/authMiddleware');
const propertyController = require('../controllers/propertyController');

const router = Router();

router.get('/properties', tokenRequired, propertyController.getMyProperties);
router.post('/properties', tokenRequired, propertyController.createProperty);
router.put('/properties/:id', tokenRequired, propertyController.updateProperty);
router.delete('/properties/:id', tokenRequired, propertyController.deleteProperty);

module.exports = router;
