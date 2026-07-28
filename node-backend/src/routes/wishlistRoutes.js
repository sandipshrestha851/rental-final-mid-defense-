const { Router } = require('express');
const { tokenRequired } = require('../middleware/authMiddleware');
const wishlistController = require('../controllers/wishlistController');
const recentlyViewedController = require('../controllers/recentlyViewedController');

const router = Router();

// Wishlist (auth required)
router.get('/wishlist', tokenRequired, wishlistController.getWishlist);
router.get('/wishlist/ids', tokenRequired, wishlistController.checkWishlist);
router.post('/wishlist', tokenRequired, wishlistController.addToWishlist);
router.delete('/wishlist/:propertyId', tokenRequired, wishlistController.removeFromWishlist);

// Recently viewed (auth required)
router.get('/recently-viewed', tokenRequired, recentlyViewedController.getRecentlyViewed);
router.post('/recently-viewed/:id', tokenRequired, recentlyViewedController.trackView);

module.exports = router;
