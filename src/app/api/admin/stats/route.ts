import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Booking } from '@/models/Booking';
import { Resort } from '@/models/Resort';
import { Hotel } from '@/models/Hotel';
import { Destination } from '@/models/Destination';
import { Place } from '@/models/Place';
import { Itinerary } from '@/models/Itinerary';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const [
      totalUsers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalResorts,
      totalHotels,
      totalDestinations,
      totalAttractions,
      totalItineraries,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Resort.countDocuments(),
      Hotel.countDocuments(),
      Destination.countDocuments(),
      Place.countDocuments(),
      Itinerary.countDocuments(),
      Booking.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      User.find({}).select('-password -passwordHash').sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalResorts,
        totalHotels,
        totalDestinations,
        totalAttractions,
        totalItineraries,
      },
      recentBookings: JSON.parse(JSON.stringify(recentBookings)),
      recentUsers: JSON.parse(JSON.stringify(recentUsers)),
    });
  } catch (err: any) {
    console.error('GET /api/admin/stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
