import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { Booking } from '@/models/Booking';
import { Itinerary } from '@/models/Itinerary';
import { Favorite } from '@/models/Favorite';
import { Review } from '@/models/Review';
import { Place } from '@/models/Place';
import { Destination } from '@/models/Destination';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const [bookings, itineraries, favorites, reviews] = await Promise.all([
      Booking.find({ userId: user.userId }).sort({ createdAt: -1 }).lean(),
      Itinerary.find({ userId: user.userId }).sort({ createdAt: -1 }).lean(),
      Favorite.find({ userId: user.userId }).sort({ createdAt: -1 }).lean(),
      Review.find({ userId: user.userId }).sort({ createdAt: -1 }).lean(),
    ]);

    // Fetch details for saved favorites
    const placeIds = favorites.filter((f: any) => f.itemType === 'place').map((f: any) => f.itemId);
    const destIds = favorites.filter((f: any) => f.itemType === 'destination').map((f: any) => f.itemId);

    const [savedPlacesDocs, savedDestsDocs] = await Promise.all([
      placeIds.length > 0 ? Place.find({ _id: { $in: placeIds } }).lean() : [],
      destIds.length > 0 ? Destination.find({ _id: { $in: destIds } }).lean() : [],
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalBookings: bookings.length,
          activeBookings: bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'pending').length,
          totalItineraries: itineraries.length,
          totalFavorites: favorites.length,
          totalReviews: reviews.length,
        },
        bookings: JSON.parse(JSON.stringify(bookings.slice(0, 5))),
        itineraries: JSON.parse(JSON.stringify(itineraries.slice(0, 5))),
        favorites: JSON.parse(JSON.stringify(favorites)),
        reviews: JSON.parse(JSON.stringify(reviews.slice(0, 5))),
        savedPlaces: JSON.parse(JSON.stringify(savedPlacesDocs)),
        savedDestinations: JSON.parse(JSON.stringify(savedDestsDocs)),
      },
    });
  } catch (err: any) {
    console.error('GET /api/dashboard error:', err);
    return NextResponse.json({ error: 'Failed to fetch user dashboard data' }, { status: 500 });
  }
}
