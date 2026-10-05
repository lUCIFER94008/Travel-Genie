import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Itinerary } from '@/models/Itinerary';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectToDatabase();
    const query = user.role === 'admin' ? { _id: id } : { _id: id, userId: user.userId };
    const itinerary = await Itinerary.findOne(query).lean();

    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(itinerary)) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    await connectToDatabase();
    const query = user.role === 'admin' ? { _id: id } : { _id: id, userId: user.userId };

    const updated = await Itinerary.findOneAndUpdate(
      query,
      { $set: body },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Itinerary not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updated)) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectToDatabase();
    const query = user.role === 'admin' ? { _id: id } : { _id: id, userId: user.userId };

    const deleted = await Itinerary.findOneAndDelete(query);
    if (!deleted) {
      return NextResponse.json({ error: 'Itinerary not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Itinerary deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete itinerary' }, { status: 500 });
  }
}
