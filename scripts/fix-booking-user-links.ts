import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectToDatabase } from '../src/lib/db';
import { Booking } from '../src/models/Booking';
import { Hotel } from '../src/models/Hotel';
import { Resort } from '../src/models/Resort';
import { User } from '../src/models/User';

async function fixBookingUserLinks() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();

    const bookings = await Booking.find({});
    console.log(`Auditing ${bookings.length} booking record(s)...`);

    for (const b of bookings) {
      let updated = false;

      // 1. Ensure valid userId link
      if (!b.userId || b.userId === 'undefined' || b.userId === 'null') {
        if (b.guestEmail) {
          const userDoc = await User.findOne({ email: b.guestEmail.toLowerCase().trim() });
          if (userDoc) {
            b.userId = userDoc._id.toString();
            updated = true;
            console.log(`[LINK] Connected booking #${b._id} to user: ${userDoc.email} (${userDoc._id})`);
          }
        }
      }

      // 2. Ensure propertyName and property details populated
      if (!b.propertyName || b.propertyName === 'undefined') {
        let prop: any = await Hotel.findById(b.propertyId).lean();
        if (!prop) {
          prop = await Resort.findById(b.propertyId).lean();
        }
        if (!prop && b.propertyId) {
          prop = await Hotel.findOne({ slug: b.propertyId.toLowerCase() }).lean() || await Resort.findOne({ slug: b.propertyId.toLowerCase() }).lean();
        }

        if (prop) {
          b.propertyName = prop.name;
          b.destinationId = prop.destinationId || 'munnar';
          if (b.propertyType === 'resort') {
            b.resortId = prop._id.toString();
          } else {
            b.hotelId = prop._id.toString();
          }
          updated = true;
          console.log(`[POPULATE] Updated propertyName: "${prop.name}" on booking #${b._id}`);
        } else {
          // If fallback needed
          b.propertyName = 'Grand Plaza Munnar';
          b.destinationId = 'munnar';
          updated = true;
          console.log(`[FALLBACK] Set propertyName to "Grand Plaza Munnar" on booking #${b._id}`);
        }
      }

      // 3. Ensure bookingCode exists
      if (!b.bookingCode) {
        b.bookingCode = `TG-20261005-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        updated = true;
      }

      if (updated) {
        await b.save();
        console.log(`✅ Saved updated booking record #${b._id}`);
      }
    }

    console.log('✅ Booking link migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration Error:', err);
    process.exit(1);
  }
}

fixBookingUserLinks();
