import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectToDatabase } from '../src/lib/db';
import { User } from '../src/models/User';
import { Booking } from '../src/models/Booking';

async function auditUserBookingsReport() {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email: 'mohammedrizwan.9c@gmail.com' });
    if (!user) {
      console.log('USER BOOKING AUDIT');
      console.log('User Mohammed Rizwan not found in database.');
      process.exit(0);
    }

    const userIdStr = user._id.toString();
    const bookings = await Booking.find({
      $or: [{ userId: userIdStr }, { guestEmail: user.email }],
    }).lean();

    console.log('==================================================');
    console.log('USER BOOKING AUDIT');
    console.log('==================================================');
    console.log(`User: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`User ID: ${userIdStr}`);
    console.log(`Bookings: ${bookings.length}`);

    bookings.forEach((b, idx) => {
      const match = b.userId === userIdStr ? 'YES' : 'NO';
      console.log(`\nBooking ${idx + 1}:`);
      console.log(`Property: ${b.propertyName || 'Grand Plaza Munnar'}`);
      console.log(`Booking ID: ${b._id.toString()}`);
      console.log(`userId: ${b.userId}`);
      console.log(`match: ${match}`);
    });
    console.log('==================================================');

    process.exit(0);
  } catch (err) {
    console.error('Audit Error:', err);
    process.exit(1);
  }
}

auditUserBookingsReport();
