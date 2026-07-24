const { Router } = require('express');
const userController = require('../controllers/userController');
const { tokenRequired } = require('../middleware/authMiddleware');

const router = Router();

router.get('/users', tokenRequired, userController.getUsers);

module.exports = router;
