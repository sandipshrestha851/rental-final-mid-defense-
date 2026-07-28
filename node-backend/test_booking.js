require('dotenv').config();
const { pool } = require('./src/config/database');
const bookingModel = require('./src/models/bookingModel');

async function test() {
  try {
    console.log('Testing booking creation...');
    
    // Use an existing property and guest from the diagnostic check
    const propertyId = '2de2d2a6-3c02-4f46-a5ba-df0675dd4b44'; // 'Untitled property' by landlord 2
    const guestId = 7; // Sandy (tenant)
    
    const result = await bookingModel.create({
      propertyId,
      guestId,
      checkIn: '2026-08-01',
      checkOut: '2026-08-15',
      guests: 2,
      totalAmount: 1500.00
    });
    
    console.log('Booking successfully created:', result);
  } catch (err) {
    console.error('ERROR OCCURRED during booking creation:', err);
  } finally {
    await pool.end();
  }
}

test();
