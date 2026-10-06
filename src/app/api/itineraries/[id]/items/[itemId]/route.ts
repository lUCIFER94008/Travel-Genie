import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Itinerary } from '@/models/Itinerary';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id, itemId } = await params;

  try {
    await connectToDatabase();
    const itinerary = await Itinerary.findOne({ _id: id, userId: user.userId });
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    if (itinerary.items) {
      itinerary.items = itinerary.items.filter(
        (item: any) => item._id !== itemId && item.placeId !== itemId
      );
      await itinerary.save();
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(itinerary)) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
