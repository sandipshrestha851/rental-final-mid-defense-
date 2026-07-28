const propertyModel = require('../models/propertyModel');

async function trackView(req, res, next) {
  try {
    const { id } = req.params;
    const property = await propertyModel.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.status !== 'Active') {
      return res.status(404).json({ message: 'Property not found' });
    }

    await propertyModel.trackRecentlyViewed(req.userId, id);
    res.json({ message: 'Tracked' });
  } catch (err) {
    next(err);
  }
}

async function getRecentlyViewed(req, res, next) {
  try {
    const properties = await propertyModel.getRecentlyViewed(req.userId);
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

module.exports = { trackView, getRecentlyViewed };
