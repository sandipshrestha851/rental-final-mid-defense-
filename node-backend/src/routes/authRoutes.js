const { Router } = require('express');
const authController = require('../controllers/authController');
const { registerRules, loginRules, adminLoginRules } = require('../middleware/validateRequest');

const router = Router();

router.post('/register', registerRules, authController.register);
router.post('/login', loginRules, authController.login);
router.post('/admin/login', adminLoginRules, authController.adminLogin);

module.exports = router;
