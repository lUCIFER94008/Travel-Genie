import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Destination } from '@/models/Destination';
import { calculateDistance } from '@/lib/geo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currentSlug = searchParams.get('currentSlug') || '';
    let lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : NaN;
    let lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : NaN;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 4;

    await connectToDatabase();

    let allDestinations = await Destination.find({}).lean();

    if (currentSlug) {
      const currentDest = allDestinations.find((d: any) => d.slug.toLowerCase() === currentSlug.toLowerCase());
      if (currentDest && currentDest.location?.coordinates) {
        lng = currentDest.location.coordinates[0];
        lat = currentDest.location.coordinates[1];
      }
    }

    if (isNaN(lat) || isNaN(lng)) {
      // Default to Munnar coordinates if unprovided
      lng = 77.0595;
      lat = 10.0889;
    }

    const filteredDestinations = allDestinations
      .filter((d: any) => d.slug.toLowerCase() !== currentSlug.toLowerCase())
      .map((d: any) => {
        const dLng = d.location?.coordinates?.[0] || 0;
        const dLat = d.location?.coordinates?.[1] || 0;
        const distKm = calculateDistance(lat, lng, dLat, dLng);
        return {
          _id: d._id,
          name: d.name,
          slug: d.slug,
          state: d.state,
          district: d.district,
          description: d.description,
          heroImage: d.heroImage, // Uses ITS OWN destination image!
          location: d.location,
          categories: d.categories,
          distanceKm: distKm,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(filteredDestinations)),
    });
  } catch (err: any) {
    console.error('API /api/destinations/nearby error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
