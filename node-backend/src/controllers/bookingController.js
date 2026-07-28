const bookingModel = require('../models/bookingModel');
const propertyModel = require('../models/propertyModel');
const userModel = require('../models/userModel');
const notificationModel = require('../models/notificationModel');

async function createBooking(req, res, next) {
  try {
    const { propertyId, checkIn, checkOut, guests, totalAmount, specialRequests } = req.body;

    if (!propertyId || !checkIn || !checkOut || !guests || totalAmount == null) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const guest_id = req.userId;
    if (!guest_id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ message: 'Check-in cannot be in the past' });
    }
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    const property = await propertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.status !== 'Active') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    const available = await bookingModel.checkAvailability(propertyId, checkIn, checkOut);
    if (!available) {
      return res.status(409).json({ message: 'Selected dates are not available. The property has conflicting bookings.' });
    }

    const booking = await bookingModel.create({
      propertyId, guestId: guest_id, checkIn, checkOut, guests,
      totalAmount, specialRequests,
    });

    await notificationModel.create(
      property.landlord_id,
      'New Booking Request',
      `${property.title} has a new booking request from ${checkIn} to ${checkOut}.`,
      'booking', booking.id
    );

    res.status(201).json({ message: 'Booking created successfully', bookingId: booking.id, booking });
  } catch (err) {
    next(err);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const property = await propertyModel.findById(booking.property_id);
    const isOwner = booking.guest_id === req.userId;
    const isLandlord = property && property.landlord_id === req.userId;
    const isAdmin = req.role === 'admin';

    if (!isOwner && !isLandlord && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    const history = await bookingModel.getHistory(id);
    res.json({ ...booking, history });
  } catch (err) {
    next(err);
  }
}

async function getGuestBookings(req, res, next) {
  try {
    const { guestId } = req.params;
    if (req.userId !== Number(guestId) && req.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { status } = req.query;
    const bookings = await bookingModel.findByGuestId(guestId, status);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

async function getLandlordBookings(req, res, next) {
  try {
    const { status, startDate, endDate } = req.query;
    const landlordId = req.userId;

    if (startDate && endDate) {
      const bookings = await bookingModel.findByDateRange(landlordId, startDate, endDate);
      return res.json(bookings);
    }

    const bookings = await bookingModel.findByLandlordId(landlordId, status);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

async function approveBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingModel.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const property = await propertyModel.findById(booking.property_id);
    if (!property || property.landlord_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to approve this booking' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve a booking with status: ${booking.status}` });
    }

    const available = await bookingModel.checkAvailability(booking.property_id, booking.checkIn, booking.checkOut, booking.id);
    if (!available) {
      await bookingModel.updateStatus(id, 'rejected', req.userId, 'Dates are no longer available');
      return res.status(409).json({ message: 'These dates are no longer available. Booking rejected.' });
    }

    const updated = await bookingModel.updateStatus(id, 'confirmed', req.userId, 'Approved by landlord');

    await notificationModel.create(
      booking.guest_id, 'Booking Confirmed',
      `Your booking for ${property.title} has been confirmed.`,
      'booking', booking.id
    );

    res.json({ message: 'Booking confirmed', booking: updated });
  } catch (err) {
    next(err);
  }
}

async function rejectBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const booking = await bookingModel.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const property = await propertyModel.findById(booking.property_id);
    if (!property || property.landlord_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject a booking with status: ${booking.status}` });
    }

    const updated = await bookingModel.updateStatus(id, 'rejected', req.userId, reason || 'Rejected by landlord');

    await notificationModel.create(
      booking.guest_id, 'Booking Rejected',
      `Your booking request for ${property.title} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      'booking', booking.id
    );

    res.json({ message: 'Booking rejected', booking: updated });
  } catch (err) {
    next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const booking = await bookingModel.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const property = await propertyModel.findById(booking.property_id);
    const isOwner = booking.guest_id === req.userId;
    const isLandlord = property && property.landlord_id === req.userId;
    const isAdmin = req.role === 'admin';

    if (!isOwner && !isLandlord && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    const cancellable = ['pending', 'confirmed'];
    if (!cancellable.includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel a booking with status: ${booking.status}` });
    }

    let cancelStatus;
    if (isAdmin) {
      cancelStatus = 'cancelled';
    } else if (isLandlord) {
      cancelStatus = 'cancelled_by_landlord';
    } else {
      cancelStatus = 'cancelled_by_tenant';
    }

    const updated = await bookingModel.updateStatus(id, cancelStatus, req.userId, reason || 'Cancelled');

    const notifyUserId = isOwner ? property.landlord_id : booking.guest_id;
    await notificationModel.create(
      notifyUserId, 'Booking Cancelled',
      `Booking for ${property.title} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      'booking', booking.id
    );

    res.json({ message: 'Booking cancelled', booking: updated });
  } catch (err) {
    next(err);
  }
}

async function completeBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingModel.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const property = await propertyModel.findById(booking.property_id);
    if (!property || property.landlord_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: `Cannot complete a booking with status: ${booking.status}` });
    }

    const updated = await bookingModel.updateStatus(id, 'completed', req.userId, 'Stay completed');

    await notificationModel.create(
      booking.guest_id, 'Stay Completed',
      `Your stay at ${property.title} has been marked as completed. Thank you!`,
      'booking', booking.id
    );

    res.json({ message: 'Booking completed', booking: updated });
  } catch (err) {
    next(err);
  }
}

async function checkAvailability(req, res, next) {
  try {
    const { propertyId, checkIn, checkOut, excludeBookingId } = req.query;
    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ message: 'propertyId, checkIn, and checkOut are required' });
    }

    const available = await bookingModel.checkAvailability(propertyId, checkIn, checkOut, excludeBookingId);
    res.json({ available });
  } catch (err) {
    next(err);
  }
}

async function getUnavailableDates(req, res, next) {
  try {
    const { propertyId } = req.params;
    const dates = await bookingModel.getUnavailableDates(propertyId);
    res.json(dates);
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingModel.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const property = await propertyModel.findById(booking.property_id);
    const isOwner = booking.guest_id === req.userId;
    const isLandlord = property && property.landlord_id === req.userId;
    const isAdmin = req.role === 'admin';

    if (!isOwner && !isLandlord && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const history = await bookingModel.getHistory(id);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await bookingModel.getStats(req.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getTodayCheckIns(req, res, next) {
  try {
    const bookings = await bookingModel.getTodayCheckIns(req.userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

async function getTodayCheckOuts(req, res, next) {
  try {
    const bookings = await bookingModel.getTodayCheckOuts(req.userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

async function getCurrentGuests(req, res, next) {
  try {
    const bookings = await bookingModel.getCurrentGuests(req.userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    const activity = await bookingModel.getRecentActivity(req.userId);
    res.json(activity);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking, getBookingById, getGuestBookings, getLandlordBookings,
  approveBooking, rejectBooking, cancelBooking, completeBooking,
  checkAvailability, getUnavailableDates, getHistory, getStats,
  getTodayCheckIns, getTodayCheckOuts, getCurrentGuests, getRecentActivity,
};
