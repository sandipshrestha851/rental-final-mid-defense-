const { Router } = require('express');
const { tokenRequired } = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

const router = Router();

router.get('/reviews/landlord', tokenRequired, reviewController.getReviews);
router.get('/reviews/property/:id', reviewController.getPropertyReviews);
router.post('/reviews', tokenRequired, reviewController.createReview);
router.put('/reviews/:id', tokenRequired, reviewController.updateReview);
router.delete('/reviews/:id', tokenRequired, reviewController.deleteReview);
router.post('/reviews/:id/reply', tokenRequired, reviewController.createReply);
router.put('/reviews/reply/:replyId', tokenRequired, reviewController.updateReply);
router.delete('/reviews/reply/:replyId', tokenRequired, reviewController.deleteReply);

module.exports = router;
