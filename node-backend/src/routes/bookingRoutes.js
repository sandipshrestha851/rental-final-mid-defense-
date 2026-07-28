const { Router } = require('express');
const { tokenRequired } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');
const receiptController = require('../controllers/receiptController');

const router = Router();

router.post('/bookings', tokenRequired, bookingController.createBooking);
router.get('/bookings/guest/:guestId', tokenRequired, bookingController.getGuestBookings);
router.get('/bookings/landlord', tokenRequired, bookingController.getLandlordBookings);
router.get('/bookings/stats', tokenRequired, bookingController.getStats);
router.get('/bookings/today-checkins', tokenRequired, bookingController.getTodayCheckIns);
router.get('/bookings/today-checkouts', tokenRequired, bookingController.getTodayCheckOuts);
router.get('/bookings/current-guests', tokenRequired, bookingController.getCurrentGuests);
router.get('/bookings/recent-activity', tokenRequired, bookingController.getRecentActivity);
router.get('/bookings/check-availability', bookingController.checkAvailability);
router.get('/bookings/unavailable-dates/:propertyId', bookingController.getUnavailableDates);
router.get('/bookings/:id(\\d+)/history', tokenRequired, bookingController.getHistory);
router.get('/bookings/:id(\\d+)', tokenRequired, bookingController.getBookingById);
router.put('/bookings/:id(\\d+)/approve', tokenRequired, bookingController.approveBooking);
router.put('/bookings/:id(\\d+)/reject', tokenRequired, bookingController.rejectBooking);
router.put('/bookings/:id(\\d+)/cancel', tokenRequired, bookingController.cancelBooking);
router.put('/bookings/:id(\\d+)/complete', tokenRequired, bookingController.completeBooking);
router.get('/bookings/:id(\\d+)/receipt', tokenRequired, receiptController.downloadReceipt);

module.exports = router;
