const { Router } = require('express');
const userController = require('../controllers/userController');
const { tokenRequired, adminOnly } = require('../middleware/authMiddleware');

const router = Router();

router.get('/users', tokenRequired, userController.getUsers);
router.get('/admin/users/:id', tokenRequired, adminOnly, userController.getAdminUserDetails);
router.put('/admin/users/:id/suspension', tokenRequired, adminOnly, userController.setUserSuspension);
router.put('/admin/users/:id/password', tokenRequired, adminOnly, userController.resetUserPassword);
router.delete('/admin/users/:id', tokenRequired, adminOnly, userController.deleteAdminUser);

module.exports = router;
