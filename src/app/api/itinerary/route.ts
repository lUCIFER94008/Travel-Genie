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
    const itineraries = await Itinerary.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();

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

    const title = body.title || body.name || 'Custom Travel Itinerary';
    const destinationName = body.destinationName || body.destination || 'India';

    const newItinerary = await Itinerary.create({
      userId: user.userId,
      title,
      name: title,
      destinationId: body.destinationId || undefined,
      destinationName,
      description: body.description || `Custom ${destinationName} trip itinerary.`,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      travelers: body.travelers ? parseInt(body.travelers, 10) : 1,
      notes: body.notes || '',
      items: body.items || [],
      status: 'active',
    });

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(newItinerary)) }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/itinerary error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await connectToDatabase();

    let itinerary = await Itinerary.findOne({ userId: user.userId, status: 'active' });
    if (!itinerary) {
      itinerary = await Itinerary.create({
        userId: user.userId,
        title: 'My Saved Itinerary',
        name: 'My Saved Itinerary',
        destinationName: 'India',
        items: body.items || [],
        status: 'active',
      });
    } else {
      itinerary.items = body.items || itinerary.items;
      if (body.title) itinerary.title = body.title;
      if (body.destinationName) itinerary.destinationName = body.destinationName;
      await itinerary.save();
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(itinerary)) });
  } catch (err: any) {
    console.error('PUT /api/itinerary error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
