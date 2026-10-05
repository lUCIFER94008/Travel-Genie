import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Place } from '@/models/Place';
import { Restaurant } from '@/models/Restaurant';
import { Hotel } from '@/models/Hotel';
import { Resort } from '@/models/Resort';
import { calculateDistance } from '@/lib/geo';
import { searchNearbyPlaces } from '@/lib/googlePlaces';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius') || '10'; // radius in km (default 10km)
    const category = searchParams.get('category') || searchParams.get('type') || 'all';

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Latitude (lat) and longitude (lng) parameters are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radiusKm = parseFloat(radiusStr);
    const radiusMeters = radiusKm * 1000;

    let results: any[] = [];

    // Try MongoDB $near query first
    try {
      await connectToDatabase();

      const geoNearQuery = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radiusMeters,
          },
        },
      };

      let query: any = { ...geoNearQuery };
      if (category && category !== 'all') {
        query.category = { $regex: category, $options: 'i' };
      }

      // Query Places, Restaurants, Hotels, Resorts
      const dbPlaces = await Place.find(query).lean();
      const dbRestaurants = await Restaurant.find(query).lean();
      const dbHotels = await Hotel.find(query).lean();
      const dbResorts = await Resort.find(query).lean();

      const combined = [
        ...dbPlaces.map((p) => ({ ...p, itemType: 'place' })),
        ...dbRestaurants.map((r) => ({ ...r, itemType: 'restaurant' })),
        ...dbHotels.map((h) => ({ ...h, itemType: 'hotel' })),
        ...dbResorts.map((res) => ({ ...res, itemType: 'resort' })),
      ];

      if (combined.length > 0) {
        results = combined.map((item) => {
          const itemLng = item.location?.coordinates?.[0] || lng;
          const itemLat = item.location?.coordinates?.[1] || lat;
          const dist = calculateDistance(lat, lng, itemLat, itemLng);
          return {
            ...item,
            id: item._id?.toString() || item.slug,
            distanceKm: dist,
            distance: Math.round(dist * 1000), // distance in meters
          };
        }).sort((a, b) => a.distanceKm - b.distanceKm);
      }
    } catch (dbErr) {
      console.warn('MongoDB $near query fallback:', dbErr);
    }

    // If MongoDB returned 0 results and Google Places API key is present, search Google Places
    if (results.length === 0 && process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const googleResults = await searchNearbyPlaces(lat, lng, radiusMeters);
        if (googleResults && googleResults.length > 0) {
          results = googleResults.map((g) => {
            const dist = calculateDistance(lat, lng, g.latitude || lat, g.longitude || lng);
            return {
              ...g,
              distanceKm: dist,
              distance: Math.round(dist * 1000),
            };
          }).sort((a, b) => a.distanceKm - b.distanceKm);
        }
      } catch (gErr) {
        console.warn('Google Places API search error:', gErr);
      }
    }

    return NextResponse.json({
      success: true,
      center: { lat, lng },
      radiusKm,
      count: results.length,
      places: results,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch nearby places' }, { status: 500 });
  }
}
