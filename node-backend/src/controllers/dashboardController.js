const dashboardModel = require('../models/dashboardModel');

const dashboardController = {
  async getSummary(req, res, next) {
    try {
      const [stats, revenue, occupancy, activeListings, analytics] = await Promise.all([
        dashboardModel.getStats(req.userId),
        dashboardModel.getRevenue(req.userId),
        dashboardModel.getOccupancy(req.userId),
        dashboardModel.getActiveListings(req.userId),
        dashboardModel.getPropertyAnalytics(req.userId),
      ]);
      res.json({
        totalBookings: stats.total,
        pendingBookings: stats.pending,
        confirmedBookings: stats.confirmed,
        completedBookings: stats.completed,
        cancelledBookings: stats.cancelled,
        rejectedBookings: stats.rejected,
        totalRevenue: revenue.totalRevenue,
        ytdRevenue: revenue.ytdRevenue,
        monthlyEarnings: revenue.monthly,
        averageBookingValue: revenue.averageBookingValue,
        overallOccupancyRate: occupancy.overallOccupancyRate,
        activeListings,
        totalViews: analytics.totalViews,
      });
    } catch (err) {
      next(err);
    }
  },

  async getRevenue(req, res, next) {
    try {
      const revenue = await dashboardModel.getRevenue(req.userId);
      res.json(revenue);
    } catch (err) {
      next(err);
    }
  },

  async getOccupancy(req, res, next) {
    try {
      const occupancy = await dashboardModel.getOccupancy(req.userId);
      res.json(occupancy);
    } catch (err) {
      next(err);
    }
  },

  async getBookingStats(req, res, next) {
    try {
      const { startDate, endDate, propertyId, status } = req.query;
      const stats = await dashboardModel.getStats(req.userId, { startDate, endDate, propertyId, status });
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getPropertyAnalytics(req, res, next) {
    try {
      const analytics = await dashboardModel.getPropertyAnalytics(req.userId);
      res.json(analytics);
    } catch (err) {
      next(err);
    }
  },

  async getBookingTrends(req, res, next) {
    try {
      const { period, startDate, endDate } = req.query;
      const trends = await dashboardModel.getBookingTrends(req.userId, period || 'monthly', startDate, endDate);
      res.json(trends);
    } catch (err) {
      next(err);
    }
  },

  async getIncomeCharts(req, res, next) {
    try {
      const revenue = await dashboardModel.getRevenue(req.userId);
      const occupancy = await dashboardModel.getOccupancy(req.userId);
      res.json({
        monthlyRevenue: revenue.monthly,
        occupancyTrend: occupancy,
      });
    } catch (err) {
      next(err);
    }
  },

  async trackView(req, res, next) {
    try {
      await dashboardModel.trackPropertyView(req.params.id);
      res.status(200).json({ message: 'View tracked' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;
