const { Router } = require('express');
const authController = require('../controllers/authController');
const { tokenRequired } = require('../middleware/authMiddleware');
const { registerRules, loginRules, adminLoginRules } = require('../middleware/validateRequest');

const router = Router();

router.post('/register', registerRules, authController.register);
router.post('/login', loginRules, authController.login);
router.post('/admin/login', adminLoginRules, authController.adminLogin);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', tokenRequired, authController.logout);
router.get('/auth/me', tokenRequired, authController.me);
router.get('/auth/csrf', (req, res) => {
  const { setCsrfCookie } = require('../middleware/csrf');
  const token = setCsrfCookie(null, res);
  res.json({ csrfToken: token });
});

module.exports = router;
