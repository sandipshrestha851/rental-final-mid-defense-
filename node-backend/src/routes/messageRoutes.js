const { Router } = require('express');
const messageController = require('../controllers/messageController');
const { tokenRequired } = require('../middleware/authMiddleware');
const { messageParamRules } = require('../middleware/validateRequest');

const router = Router();

router.get('/messages/:otherUserId', tokenRequired, messageParamRules, messageController.getMessages);

module.exports = router;
