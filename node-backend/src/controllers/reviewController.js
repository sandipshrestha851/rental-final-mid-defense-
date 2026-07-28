const dashboardModel = require('../models/dashboardModel');
const { pool } = require('../config/database');
const NotificationService = require('../services/notificationService');

const reviewController = {
  async getReviews(req, res, next) {
    try {
      const { sortBy, sortOrder, search, rating } = req.query;
      const reviews = await dashboardModel.getReviewsByLandlord(req.userId, { sortBy, sortOrder, search, rating });
      const grouped = reviews.reduce((acc, row) => {
        const existing = acc.find(r => r.id === row.id);
        if (existing) {
          if (row.reply_id) {
            existing.reply = { id: row.reply_id, text: row.reply_text, createdAt: row.reply_created_at, updatedAt: row.reply_updated_at };
          }
        } else {
          acc.push({
            id: row.id,
            propertyId: row.property_id,
            userId: row.user_id,
            rating: row.rating,
            comment: row.comment,
            createdAt: row.created_at,
            guestName: row.guest_name,
            propertyTitle: row.property_title,
            reply: row.reply_id ? { id: row.reply_id, text: row.reply_text, createdAt: row.reply_created_at, updatedAt: row.reply_updated_at } : null,
          });
        }
        return acc;
      }, []);
      res.json(grouped);
    } catch (err) {
      next(err);
    }
  },

  async getPropertyReviews(req, res, next) {
    try {
      const reviews = await dashboardModel.getReviewsByProperty(req.params.id);
      const grouped = reviews.reduce((acc, row) => {
        const existing = acc.find(r => r.id === row.id);
        if (existing) {
          if (row.reply_id) {
            existing.reply = { id: row.reply_id, text: row.reply_text, createdAt: row.reply_created_at, updatedAt: row.reply_updated_at };
          }
        } else {
          acc.push({
            id: row.id,
            propertyId: row.property_id,
            userId: row.user_id,
            rating: row.rating,
            comment: row.comment,
            createdAt: row.created_at,
            guestName: row.guest_name,
            propertyTitle: row.property_title,
            reply: row.reply_id ? { id: row.reply_id, text: row.reply_text, createdAt: row.reply_created_at, updatedAt: row.reply_updated_at } : null,
          });
        }
        return acc;
      }, []);
      res.json(grouped);
    } catch (err) {
      next(err);
    }
  },

  async createReview(req, res, next) {
    try {
      const { propertyId, rating, comment } = req.body;
      if (!propertyId || !rating || !comment) {
        return res.status(400).json({ message: 'propertyId, rating, and comment are required' });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      const id = await dashboardModel.createReview(propertyId, req.userId, rating, comment);

      // Trigger notification for landlord
      const propertyModel = require('../models/propertyModel');
      const property = await propertyModel.findById(propertyId);
      if (property) {
        await NotificationService.notify({
          recipientUserId: property.landlord_id,
          senderUserId: req.userId,
          type: 'new_review',
          title: 'New Review Received',
          message: `Your property "${property.title}" received a ${rating}-star review.`,
          referenceType: 'review',
          referenceId: id
        });
      }

      res.status(201).json({ id, message: 'Review created' });
    } catch (err) {
      next(err);
    }
  },

  async updateReview(req, res, next) {
    try {
      const { rating, comment } = req.body;
      if (!rating || !comment) {
        return res.status(400).json({ message: 'rating and comment are required' });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      const existing = await dashboardModel.getReviewById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Review not found' });
      }
      if (existing.user_id !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to edit this review' });
      }
      await dashboardModel.updateReview(Number(req.params.id), existing.property_id, rating, comment.trim());
      res.json({ message: 'Review updated' });
    } catch (err) {
      next(err);
    }
  },

  async deleteReview(req, res, next) {
    try {
      const existing = await dashboardModel.getReviewById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Review not found' });
      }
      if (existing.user_id !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this review' });
      }
      await dashboardModel.deleteReview(Number(req.params.id));
      res.json({ message: 'Review deleted' });
    } catch (err) {
      next(err);
    }
  },

  async createReply(req, res, next) {
    try {
      const { reply } = req.body;
      if (!reply || !reply.trim()) {
        return res.status(400).json({ message: 'Reply text is required' });
      }
      const review = await dashboardModel.getReviewById(req.params.id);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      const id = await dashboardModel.createReply(Number(req.params.id), req.userId, reply.trim());

      // Trigger notification for guest/tenant
      const propertyModel = require('../models/propertyModel');
      const property = await propertyModel.findById(review.property_id);
      const propertyTitle = property ? property.title : 'your property';
      await NotificationService.notify({
        recipientUserId: review.user_id,
        senderUserId: req.userId,
        type: 'review_reply',
        title: 'Review Replied',
        message: `The landlord replied to your review on "${propertyTitle}".`,
        referenceType: 'review',
        referenceId: review.id
      });

      res.status(201).json({ id, message: 'Reply created' });
    } catch (err) {
      next(err);
    }
  },

  async updateReply(req, res, next) {
    try {
      const { reply } = req.body;
      if (!reply || !reply.trim()) {
        return res.status(400).json({ message: 'Reply text is required' });
      }
      const existing = await dashboardModel.getReplyById(req.params.replyId);
      if (!existing) {
        return res.status(404).json({ message: 'Reply not found' });
      }
      await dashboardModel.updateReply(Number(req.params.replyId), reply.trim());
      res.json({ message: 'Reply updated' });
    } catch (err) {
      next(err);
    }
  },

  async deleteReply(req, res, next) {
    try {
      const existing = await dashboardModel.getReplyById(req.params.replyId);
      if (!existing) {
        return res.status(404).json({ message: 'Reply not found' });
      }
      await dashboardModel.deleteReply(Number(req.params.replyId));
      res.json({ message: 'Reply deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = reviewController;
