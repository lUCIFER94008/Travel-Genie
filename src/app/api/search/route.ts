import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Destination } from '@/models/Destination';
import { Place } from '@/models/Place';
import { Restaurant } from '@/models/Restaurant';
import { Hotel } from '@/models/Hotel';
import { Resort } from '@/models/Resort';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        destinations: [],
        places: [],
        restaurants: [],
        hotels: [],
        resorts: [],
      });
    }

    await connectToDatabase();

    const regex = new RegExp(query, 'i');

    const [destinations, places, restaurants, hotels, resorts] = await Promise.all([
      Destination.find({
        $or: [
          { name: regex },
          { state: regex },
          { district: regex },
          { categories: regex },
        ],
      })
        .limit(6)
        .lean(),

      Place.find({
        $or: [
          { name: regex },
          { category: regex },
          { address: regex },
          { description: regex },
        ],
      })
        .limit(10)
        .lean(),

      Restaurant.find({
        $or: [
          { name: regex },
          { cuisine: regex },
          { address: regex },
        ],
      })
        .limit(6)
        .lean(),

      Hotel.find({
        $or: [
          { name: regex },
          { address: regex },
          { amenities: regex },
        ],
      })
        .limit(6)
        .lean(),

      Resort.find({
        $or: [
          { name: regex },
          { address: regex },
          { amenities: regex },
        ],
      })
        .limit(6)
        .lean(),
    ]);

    return NextResponse.json({
      destinations,
      places,
      restaurants,
      hotels,
      resorts,
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
