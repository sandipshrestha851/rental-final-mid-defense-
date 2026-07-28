const propertyModel = require('../models/propertyModel');

async function addToWishlist(req, res, next) {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: 'Property ID is required' });

    const property = await propertyModel.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    await propertyModel.addToWishlist(req.userId, propertyId);
    const wishlisted = await propertyModel.isWishlisted(req.userId, propertyId);
    res.status(201).json({ message: wishlisted ? 'Added to wishlist' : 'Already in wishlist', wishlisted: true });
  } catch (err) {
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const { propertyId } = req.params;
    await propertyModel.removeFromWishlist(req.userId, propertyId);
    res.json({ message: 'Removed from wishlist', wishlisted: false });
  } catch (err) {
    next(err);
  }
}

async function getWishlist(req, res, next) {
  try {
    const properties = await propertyModel.getWishlist(req.userId);
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

async function checkWishlist(req, res, next) {
  try {
    const ids = await propertyModel.getWishlistIds(req.userId);
    res.json({ wishlistedIds: ids });
  } catch (err) {
    next(err);
  }
}

module.exports = { addToWishlist, removeFromWishlist, getWishlist, checkWishlist };
