import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Restaurant } from '@/models/Restaurant';
import { Place } from '@/models/Place';
import { calculateDistance } from '@/lib/geo';
import { searchNearbyPlaces } from '@/lib/googlePlaces';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId') || undefined;
    let lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : NaN;
    let lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : NaN;
    const radiusMeters = searchParams.get('radius') ? parseInt(searchParams.get('radius')!, 10) : 5000;

    await connectToDatabase();

    let targetPlace: any = null;
    if (placeId) {
      targetPlace = await Place.findOne({
        $or: [
          { _id: placeId.match(/^[0-9a-fA-F]{24}$/) ? placeId : undefined },
          { slug: placeId.toLowerCase() },
        ].filter(Boolean),
      }).lean();

      if (targetPlace && targetPlace.location?.coordinates) {
        lng = targetPlace.location.coordinates[0];
        lat = targetPlace.location.coordinates[1];
      }
    }

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: 'Valid latitude and longitude or placeId are required' },
        { status: 400 }
      );
    }

    const maxDistanceKm = radiusMeters / 1000;

    // 1. Check MongoDB cache first
    let queryFilter: any = {};
    if (targetPlace) {
      const targetIdStr = targetPlace._id.toString();
      queryFilter.$or = [
        { nearbyPlaceId: targetIdStr },
        { destinationId: targetPlace.destinationId },
      ];
    }

    let existingRestaurants = await Restaurant.find(queryFilter).lean();

    // 2. If missing/empty in DB and Google Places key is available, fetch live
    if ((!existingRestaurants || existingRestaurants.length === 0) && process.env.GOOGLE_MAPS_API_KEY) {
      const googleResults = await searchNearbyPlaces(lat, lng, radiusMeters, ['restaurant', 'cafe', 'food']);
      if (googleResults && googleResults.length > 0) {
        for (const gRest of googleResults) {
          if (!gRest.latitude || !gRest.longitude) continue;
          const restSlug = gRest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          await Restaurant.findOneAndUpdate(
            { googlePlaceId: gRest.googlePlaceId },
            {
              $set: {
                name: gRest.name,
                slug: restSlug,
                destinationId: targetPlace?.destinationId || 'general',
                nearbyPlaceId: targetPlace ? targetPlace._id.toString() : undefined,
                address: gRest.address || 'Local verified area',
                location: {
                  type: 'Point',
                  coordinates: [gRest.longitude, gRest.latitude],
                },
                primaryPhoto: {
                  url: gRest.primaryPhoto?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
                  source: 'Google Places',
                },
                rating: gRest.rating || 4.2,
                ratingCount: gRest.userRatingCount || 50,
                phone: gRest.phoneNumber || '',
                website: gRest.websiteUri || '',
                googlePlaceId: gRest.googlePlaceId,
                googleMapsUrl: gRest.googleMapsUrl,
                verified: true,
                source: 'Google Places API',
              },
            },
            { upsert: true, new: true }
          );
        }
        existingRestaurants = await Restaurant.find(queryFilter).lean();
      }
    }

    // 3. Fallback: query all restaurants if destination specific failed
    if (!existingRestaurants || existingRestaurants.length === 0) {
      existingRestaurants = await Restaurant.find({}).lean();
    }

    // 4. Calculate exact Haversine distance and sort nearest first
    const restaurantsWithDistance = existingRestaurants
      .filter((r: any) => r.location?.coordinates && r.location.coordinates.length >= 2)
      .map((r: any) => {
        const rLng = r.location.coordinates[0];
        const rLat = r.location.coordinates[1];
        const distKm = calculateDistance(lat, lng, rLat, rLng);
        return {
          ...r,
          distanceKm: distKm,
        };
      })
      .filter((r: any) => r.distanceKm <= Math.max(maxDistanceKm, 50))
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(restaurantsWithDistance)),
    });
  } catch (err: any) {
    console.error('API /api/restaurants/nearby error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
