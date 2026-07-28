const path = require('path');
const fs = require('fs');
const propertyModel = require('../models/propertyModel');
const { logger } = require('../utils/logger');
const { pool } = require('../config/database');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/properties');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

async function uploadImages(req, res, next) {
  try {
    const { id } = req.params;
    logger.info(`Upload request for property ${id}, userId: ${req.userId}, files: ${req.files?.length || 0}`);

    const existing = await propertyModel.findById(id);
    if (!existing) {
      logger.warn(`Upload failed: property ${id} not found`);
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.landlord_id !== req.userId && req.role !== 'admin') {
      logger.warn(`Upload failed: user ${req.userId} not owner of property ${id}`);
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.files || req.files.length === 0) {
      logger.warn(`Upload failed: no files in request for property ${id}`);
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const saved = [];
    for (const file of req.files) {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        logger.warn(`Upload failed: invalid type ${file.mimetype} for ${file.originalname}`);
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: `Invalid file type: ${file.originalname}` });
      }
      if (file.size > MAX_SIZE) {
        logger.warn(`Upload failed: file too large ${file.size} for ${file.originalname}`);
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: `File too large: ${file.originalname}. Max 5MB` });
      }
      const imageUrl = `/uploads/properties/${file.filename}`;
      logger.info(`Inserting property_images row: property_id=${id}, url=${imageUrl}`);
      await propertyModel.addImage(id, imageUrl);
      saved.push({ filename: file.filename, url: imageUrl });
    }

    if (saved.length > 0) {
      logger.info(`Updating properties.image_url for ${id} to ${saved[0].url}`);
      await pool.query(
        'UPDATE properties SET image_url = ? WHERE id = ?',
        [saved[0].url, id]
      );
    }

    const images = await propertyModel.getImages(id);
    logger.info(`Upload complete for ${id}: ${images.length} images in DB`);
    res.status(201).json({ message: `${saved.length} image(s) uploaded`, images });
  } catch (err) {
    logger.error(`Upload error for property ${req.params.id}: ${err.message}`);
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const { imageId } = req.params;
    const [rows] = await pool.query(
      'SELECT pi.*, p.landlord_id FROM property_images pi JOIN properties p ON pi.property_id = p.id WHERE pi.id = ?',
      [imageId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Image not found' });
    const image = rows[0];
    if (image.landlord_id !== req.userId && req.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filePath = path.join(UPLOAD_DIR, path.basename(image.image_url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await propertyModel.removeImage(imageId);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
}

async function updateImageOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { imageIds } = req.body;
    const existing = await propertyModel.findById(id);
    if (!existing) return res.status(404).json({ message: 'Property not found' });
    if (existing.landlord_id !== req.userId && req.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!Array.isArray(imageIds)) return res.status(400).json({ message: 'imageIds must be an array' });

    await propertyModel.updateImageOrder(id, imageIds);
    const images = await propertyModel.getImages(id);
    res.json({ message: 'Image order updated', images });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadImages, deleteImage, updateImageOrder };
