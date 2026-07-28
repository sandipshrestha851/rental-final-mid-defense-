const PDFDocument = require('pdfkit');
const bookingModel = require('../models/bookingModel');
const propertyModel = require('../models/propertyModel');

async function downloadReceipt(req, res, next) {
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

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${id}.pdf`);
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').text('RentNest', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('Room Rental Platform', { align: 'center' });
    doc.moveDown(2);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ccc');
    doc.moveDown();

    doc.fontSize(18).font('Helvetica-Bold').fillColor('#333').text('Booking Receipt', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text(`Invoice #: INV-${String(booking.id).padStart(6, '0')}`, { align: 'right' });
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#eee');
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Guest Information');
    doc.fontSize(10).font('Helvetica').fillColor('#555');
    doc.text(`Name: ${booking.guestName || 'N/A'}`);
    doc.text(`Email: ${booking.guestEmail || 'N/A'}`);
    doc.text(`Phone: ${booking.guestPhone || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Property Information');
    doc.fontSize(10).font('Helvetica').fillColor('#555');
    doc.text(`Property: ${booking.propertyName || 'N/A'}`);
    doc.text(`Location: ${booking.location || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Booking Details');
    doc.fontSize(10).font('Helvetica').fillColor('#555');
    doc.text(`Booking ID: ${booking.id}`);
    doc.text(`Status: ${booking.status?.replace(/_/g, ' ') || 'N/A'}`);
    doc.text(`Check-in: ${booking.checkIn || 'N/A'}`);
    doc.text(`Check-out: ${booking.checkOut || 'N/A'}`);

    const nights = Math.ceil(
      (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)
    );
    doc.text(`Nights: ${nights}`);
    doc.text(`Guests: ${booking.guests}`);
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Payment Summary');
    doc.moveDown();

    const price = Number(booking.totalPrice) || 0;
    const monthlyPrice = Number(booking.price) || Math.round(price / Math.max(1, nights / 30));
    const months = Math.max(1, Math.round(nights / 30));
    const rentTotal = monthlyPrice * months;
    const cleaningFee = Math.round(monthlyPrice * 0.05);
    const serviceFee = Math.round(monthlyPrice * 0.03);
    const calculatedTotal = rentTotal + cleaningFee + serviceFee;

    doc.fontSize(10).font('Helvetica').fillColor('#555');
    doc.text(`Rent ($${monthlyPrice.toLocaleString()} x ${months} mo):`, 50, doc.y, { continued: true });
    doc.text(`$${rentTotal.toLocaleString()}`, { align: 'right' });

    doc.text(`Cleaning fee:`, 50, doc.y, { continued: true });
    doc.text(`$${cleaningFee.toLocaleString()}`, { align: 'right' });

    doc.text(`Service fee:`, 50, doc.y, { continued: true });
    doc.text(`$${serviceFee.toLocaleString()}`, { align: 'right' });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ddd');
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333');
    doc.text(`Total Paid:`, 50, doc.y, { continued: true });
    doc.text(`$${price.toLocaleString()}`, { align: 'right' });

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ccc');
    doc.moveDown();

    doc.fontSize(8).font('Helvetica').fillColor('#999').text(
      'This is a computer-generated receipt. No signature is required.',
      { align: 'center' }
    );
    doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { downloadReceipt };
