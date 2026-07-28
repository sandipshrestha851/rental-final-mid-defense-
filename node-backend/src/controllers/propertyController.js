const propertyModel = require('../models/propertyModel');
const crypto = require('crypto');
const { pool } = require('../config/database');
const NotificationService = require('../services/notificationService');

const PROTECTED_FIELDS = [
  'landlord_id', 'ownerId', 'approvalStatus', 'verified',
  'bookingCount', 'createdBy', 'adminNotes',
  'rating', 'review_count',
];

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
      rating, price, amenities, photos,
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
      bookings: 0,
      amenities: amenities || null,
      photos: photos || null,
    });

    await NotificationService.notify({
      recipientRole: 'admin',
      senderUserId: req.userId,
      type: 'property_submitted',
      title: 'New Property Submitted',
      message: `A new property "${title}" has been submitted for review.`,
      referenceType: 'property',
      referenceId: property.id
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

    const safeBody = { ...req.body };
    for (const field of PROTECTED_FIELDS) {
      delete safeBody[field];
    }

    const updated = await propertyModel.update(req.params.id, safeBody);

    try {
      const [activeBookings] = await pool.query(
        "SELECT id, guest_id FROM bookings WHERE property_id = ? AND status IN ('pending', 'confirmed')",
        [req.params.id]
      );
      for (const booking of activeBookings) {
        await NotificationService.notify({
          recipientUserId: booking.guest_id,
          senderUserId: req.userId,
          type: 'property_updated',
          title: 'Property Updated',
          message: `The property "${existing.title}" has been updated, affecting your active booking.`,
          referenceType: 'booking',
          referenceId: booking.id
        });
      }
    } catch (bookingErr) {
      console.error('Failed to notify tenants of property update:', bookingErr.message);
    }

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

    if (status === 'Active') {
      await NotificationService.notify({
        recipientUserId: existing.landlord_id,
        senderUserId: req.userId,
        type: 'property_approved',
        title: 'Property Approved',
        message: `Your property "${existing.title}" has been approved.`,
        referenceType: 'property',
        referenceId: existing.id
      });
    } else if (status === 'Rejected') {
      await NotificationService.notify({
        recipientUserId: existing.landlord_id,
        senderUserId: req.userId,
        type: 'property_rejected',
        title: 'Property Rejected',
        message: `Your property "${existing.title}" has been rejected.`,
        referenceType: 'property',
        referenceId: existing.id
      });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function getActiveProperties(req, res, next) {
  try {
    const properties = await propertyModel.findAllActive();
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

async function getActivePropertyById(req, res, next) {
  try {
    const property = await propertyModel.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.status !== 'Active') {
      return res.status(404).json({ message: 'Property not found' });
    }
    const images = await propertyModel.getImages(req.params.id);
    property.images = images;
    res.json(property);
  } catch (err) {
    next(err);
  }
}

async function getPropertyById(req, res, next) {
  try {
    const property = await propertyModel.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.landlord_id !== req.userId && req.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const images = await propertyModel.getImages(req.params.id);
    property.images = images;
    res.json(property);
  } catch (err) {
    next(err);
  }
}

async function searchProperties(req, res, next) {
  try {
    const {
      keyword, minPrice, maxPrice, category, propertyType,
      beds, baths, minGuests, amenities, city, sort, page, pageSize,
    } = req.query;
    const result = await propertyModel.searchActive({
      keyword, minPrice, maxPrice, category, propertyType,
      beds, baths, minGuests,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : [amenities]) : undefined,
      city, sort, page, pageSize,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getSimilarProperties(req, res, next) {
  try {
    const property = await propertyModel.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const similar = await propertyModel.findSimilar(property, parseInt(req.query.limit) || 6);
    res.json(similar);
  } catch (err) {
    next(err);
  }
}

async function getShareInfo(req, res, next) {
  try {
    const property = await propertyModel.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      url: `${baseUrl}/property/${property.id}`,
      title: property.title,
      description: property.description ? property.description.substring(0, 200) : `Rental in ${property.location || property.city}`,
      image: property.image_url ? `${baseUrl}${property.image_url}` : '',
      price: property.price,
      location: property.location || property.city || '',
    });
  } catch (err) {
    next(err);
  }
}

async function getPropertyImages(req, res, next) {
  try {
    const property = await propertyModel.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const images = await propertyModel.getImages(req.params.id);
    res.json(images);
  } catch (err) {
    next(err);
  }
}

async function trackView(req, res, next) {
  try {
    const dashboardModel = require('../models/dashboardModel');
    await dashboardModel.trackPropertyView(req.params.id);
    res.status(200).json({ message: 'View tracked' });
  } catch (err) {
    next(err);
  }
}

async function updatePropertyStatus(req, res, next) {
  try {
    const existing = await propertyModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Property not found' });
    if (existing.landlord_id !== req.userId) return res.status(403).json({ message: 'Not authorized' });
    const { status } = req.body;
    const allowed = ['Active', 'Draft'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const updated = await propertyModel.update(req.params.id, { status });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyProperties, createProperty, updateProperty, deleteProperty,
  getAllProperties, adminUpdatePropertyStatus,
  getActiveProperties, getActivePropertyById, getPropertyById,
  searchProperties, getSimilarProperties, getShareInfo,
  getPropertyImages, updatePropertyStatus, trackView,
};
