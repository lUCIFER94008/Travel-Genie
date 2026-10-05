import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Booking } from '@/models/Booking';
import { Hotel } from '@/models/Hotel';
import { Resort } from '@/models/Resort';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const BookingSchema = z.object({
  propertyId: z.string({ message: 'Property ID is required.' }).min(1, 'Property ID is required.'),
  propertyType: z.enum(['hotel', 'resort']),
  destinationId: z.string().optional(),
  checkIn: z.string({ message: 'Check-in date is required.' }).min(1, 'Check-in date is required.'),
  checkOut: z.string({ message: 'Check-out date is required.' }).min(1, 'Check-out date is required.'),
  guests: z.number().min(1, 'At least 1 guest is required.'),
  rooms: z.number().min(1, 'At least 1 room is required.'),
  guestName: z.string({ message: 'Please enter your full name.' }).min(2, 'Name must be at least 2 characters.'),
  guestPhone: z.string({ message: 'Please enter your phone number.' }).min(6, 'Please enter a valid phone number.'),
  guestEmail: z.string({ message: 'Please enter a valid email address.' }).email('Please enter a valid email address.'),
  specialRequest: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    let queryObj: any = {};

    if (user.role === 'admin') {
      // Admin sees all bookings
      queryObj = {};
    } else if (user.role === 'resort_manager') {
      // Resort manager sees ONLY assigned property bookings
      const managedIds = user.managedResortIds || [];
      queryObj = { propertyId: { $in: managedIds } };
    } else {
      // Normal user sees ONLY their own bookings (matching string or ObjectId)
      queryObj = {
        $or: [
          { userId: user.userId },
          { guestEmail: user.email.toLowerCase().trim() },
        ],
      };
    }

    const bookings = await Booking.find(queryObj).sort({ createdAt: -1 }).lean();

    // Populate property details (photo, address, destination) for each booking
    const populatedBookings = await Promise.all(
      bookings.map(async (b: any) => {
        let propDoc: any = null;
        if (b.propertyType === 'resort') {
          if (mongoose.Types.ObjectId.isValid(b.propertyId)) {
            propDoc = await Resort.findById(b.propertyId).select('name primaryPhoto address destinationId').lean();
          }
          if (!propDoc) {
            propDoc = await Resort.findOne({ slug: (b.propertyId || '').toLowerCase() }).select('name primaryPhoto address destinationId').lean();
          }
        } else {
          if (mongoose.Types.ObjectId.isValid(b.propertyId)) {
            propDoc = await Hotel.findById(b.propertyId).select('name primaryPhoto address destinationId').lean();
          }
          if (!propDoc) {
            propDoc = await Hotel.findOne({ slug: (b.propertyId || '').toLowerCase() }).select('name primaryPhoto address destinationId').lean();
          }
          if (!propDoc) {
            propDoc = await Resort.findById(b.propertyId).select('name primaryPhoto address destinationId').lean() ||
                      await Resort.findOne({ slug: (b.propertyId || '').toLowerCase() }).select('name primaryPhoto address destinationId').lean();
          }
        }

        const primaryPhotoUrl = typeof propDoc?.primaryPhoto === 'object' ? propDoc?.primaryPhoto?.url : propDoc?.primaryPhoto;

        return {
          ...b,
          propertyName: b.propertyName || propDoc?.name || 'Grand Plaza Munnar',
          propertyAddress: propDoc?.address || 'Munnar, Kerala, India',
          propertyPhoto: primaryPhotoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          destinationId: b.destinationId || propDoc?.destinationId || 'munnar',
        };
      })
    );

    const serialized = JSON.parse(JSON.stringify(populatedBookings));

    return NextResponse.json({
      success: true,
      count: serialized.length,
      data: serialized,
      bookings: serialized,
    });
  } catch (err: any) {
    console.error('GET /api/bookings error:', err);
    return NextResponse.json({ success: false, count: 0, data: [], bookings: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Please sign in to submit a booking request.' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();

    // Map frontend contact fields to guest fields for full compatibility
    const normalizedBody = {
      propertyId: rawBody.propertyId || rawBody.hotelId || rawBody.resortId,
      propertyType: rawBody.propertyType || (rawBody.resortId ? 'resort' : 'hotel'),
      destinationId: rawBody.destinationId,
      checkIn: rawBody.checkIn,
      checkOut: rawBody.checkOut,
      guests: Number(rawBody.guests) || 1,
      rooms: Number(rawBody.rooms) || 1,
      guestName: (rawBody.guestName || rawBody.contactName || '').trim(),
      guestPhone: (rawBody.guestPhone || rawBody.contactPhone || '').trim(),
      guestEmail: (rawBody.guestEmail || rawBody.contactEmail || '').trim(),
      specialRequest: (rawBody.specialRequest || rawBody.specialRequests || '').trim(),
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('[BOOKING REQUEST INCOMING]', {
        userId: user.userId,
        propertyId: normalizedBody.propertyId,
        propertyType: normalizedBody.propertyType,
        destinationId: normalizedBody.destinationId,
        checkIn: normalizedBody.checkIn,
        checkOut: normalizedBody.checkOut,
        guests: normalizedBody.guests,
        rooms: normalizedBody.rooms,
        hasName: Boolean(normalizedBody.guestName),
        hasPhone: Boolean(normalizedBody.guestPhone),
        hasEmail: Boolean(normalizedBody.guestEmail),
      });
    }

    const parsed = BookingSchema.parse(normalizedBody);

    // Validate Check-in vs Check-out dates
    const checkInDate = new Date(parsed.checkIn);
    const checkOutDate = new Date(parsed.checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: 'Please select a valid check-in and check-out date.' }, { status: 400 });
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date.' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify Property Existence
    let propertyDoc: any = null;
    if (parsed.propertyType === 'resort') {
      if (mongoose.Types.ObjectId.isValid(parsed.propertyId)) {
        propertyDoc = await Resort.findById(parsed.propertyId).lean();
      }
      if (!propertyDoc) {
        propertyDoc = await Resort.findOne({ slug: parsed.propertyId.toLowerCase() }).lean();
      }
    } else {
      if (mongoose.Types.ObjectId.isValid(parsed.propertyId)) {
        propertyDoc = await Hotel.findById(parsed.propertyId).lean();
      }
      if (!propertyDoc) {
        propertyDoc = await Hotel.findOne({ slug: parsed.propertyId.toLowerCase() }).lean();
      }
      if (!propertyDoc) {
        propertyDoc = await Resort.findById(parsed.propertyId).lean() || await Resort.findOne({ slug: parsed.propertyId.toLowerCase() }).lean();
        if (propertyDoc) {
          parsed.propertyType = 'resort';
        }
      }
    }

    if (!propertyDoc) {
      return NextResponse.json({ error: 'Selected property was not found.' }, { status: 404 });
    }

    const finalDestinationId = propertyDoc.destinationId || parsed.destinationId || '';

    // Generate human-readable bookingCode
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingCode = `TG-${dateStr}-${randStr}`;

    const newBooking = await Booking.create({
      userId: user.userId,
      bookingCode,
      propertyType: parsed.propertyType,
      propertyId: propertyDoc._id.toString(),
      propertyName: propertyDoc.name,
      destinationId: finalDestinationId,
      hotelId: parsed.propertyType === 'hotel' ? propertyDoc._id.toString() : undefined,
      resortId: parsed.propertyType === 'resort' ? propertyDoc._id.toString() : undefined,
      checkIn: parsed.checkIn,
      checkOut: parsed.checkOut,
      guests: parsed.guests,
      rooms: parsed.rooms,
      guestName: parsed.guestName,
      guestPhone: parsed.guestPhone,
      guestEmail: parsed.guestEmail,
      specialRequest: parsed.specialRequest || '',
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        bookingId: newBooking._id.toString(),
        bookingCode: newBooking.bookingCode,
        message: 'Booking request submitted successfully.',
        data: JSON.parse(JSON.stringify(newBooking)),
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      const fieldName = firstIssue.path.join('.');
      let userFriendlyMsg = firstIssue.message;
      if (firstIssue.message.includes('expected string, received undefined')) {
        userFriendlyMsg = `Please provide a valid value for ${fieldName || 'required booking fields'}.`;
      }
      return NextResponse.json({ error: userFriendlyMsg }, { status: 400 });
    }
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: error?.message || 'Server error submitting booking request' }, { status: 500 });
  }
}
