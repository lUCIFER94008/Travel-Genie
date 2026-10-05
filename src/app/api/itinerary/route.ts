import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Itinerary } from '@/models/Itinerary';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    let itineraries = await Itinerary.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();

    if (!itineraries || itineraries.length === 0) {
      // Create initial default itinerary if user has none
      const defaultItinerary = await Itinerary.create({
        userId: user.userId,
        name: 'My First Trip Itinerary',
        title: 'My First Trip Itinerary',
        destinationName: 'India Discovery',
        description: 'Personalized travel plan created with Travel Genie.',
        status: 'active',
        items: [],
      });
      itineraries = [defaultItinerary.toObject()];
    }

    return NextResponse.json({ success: true, count: itineraries.length, data: JSON.parse(JSON.stringify(itineraries)) });
  } catch (err: any) {
    console.error('GET /api/itinerary error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await connectToDatabase();

    const newItinerary = await Itinerary.create({
      userId: user.userId,
      name: body.name || body.title || 'Custom Travel Itinerary',
      title: body.title || body.name || 'Custom Travel Itinerary',
      destinationName: body.destinationName || 'India',
      description: body.description || '',
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      items: body.items || (body.item ? [body.item] : []),
      status: 'active',
    });

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(newItinerary)) }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/itinerary error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
