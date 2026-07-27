const propertyModel = require('../models/propertyModel');
const crypto = require('crypto');

async function getMyProperties(req, res, next) {
  try {
    const properties = await propertyModel.findByLandlordId(req.userId);
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

async function createProperty(req, res, next) {
  try {
    const {
      title, description, location, category, property_type,
      address, city, state, zip_code, country,
      image_url, status, beds, baths, guests, sqft,
      rating, price, bookings, amenities, photos,
    } = req.body;

    if (!title || price == null) {
      return res.status(400).json({ message: 'Title and price are required' });
    }

    const property = await propertyModel.create({
      id: crypto.randomUUID(),
      landlord_id: req.userId,
      title,
      description,
      location: location || '',
      category,
      property_type,
      address,
      city,
      state,
      zip_code,
      country,
      image_url: image_url || '',
      status: status || 'Pending',
      beds: beds || 1,
      baths: baths || 1,
      guests,
      sqft,
      rating: rating || 0,
      price,
      bookings: bookings || 0,
      amenities: amenities || null,
      photos: photos || null,
    });

    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
}

async function updateProperty(req, res, next) {
  try {
    const existing = await propertyModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.landlord_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await propertyModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteProperty(req, res, next) {
  try {
    const existing = await propertyModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.landlord_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await propertyModel.remove(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    next(err);
  }
}

// ── Admin endpoints ──────────────────────────────────────────────────

async function getAllProperties(req, res, next) {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const properties = await propertyModel.findAll();
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

async function adminUpdatePropertyStatus(req, res, next) {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { id } = req.params;
    const { status } = req.body;

    const existing = await propertyModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const validStatuses = ['Active', 'Pending', 'Rejected', 'Draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await propertyModel.update(id, { status });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ── Public endpoint ─────────────────────────────────────────────────

async function getActiveProperties(req, res, next) {
  try {
    const properties = await propertyModel.findAllActive();
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyProperties, createProperty, updateProperty, deleteProperty,
  getAllProperties, adminUpdatePropertyStatus,
  getActiveProperties,
};
