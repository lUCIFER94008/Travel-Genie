import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Itinerary } from '@/models/Itinerary';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;
  const item = await req.json();

  try {
    await connectToDatabase();
    const itinerary = await Itinerary.findOne({ _id: id, userId: user.userId });
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    const newItem = {
      _id: new Date().getTime().toString(),
      placeId: item.placeId || item.itemId || item._id,
      placeName: item.placeName || item.name || 'Attraction',
      placeCategory: item.placeCategory || item.category || 'Sightseeing',
      placePhoto: item.placePhoto || item.image || item.primaryPhoto?.url || item.primaryPhoto || '',
      day: item.day || 1,
      time: item.time || item.startTime || '09:00',
      notes: item.notes || '',
    };

    if (!itinerary.items) itinerary.items = [];
    itinerary.items.push(newItem);
    await itinerary.save();

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(itinerary)) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
