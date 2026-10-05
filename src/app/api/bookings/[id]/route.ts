import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Booking } from '@/models/Booking';
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

    let queryObj: any = { _id: id };

    if (user.role === 'admin') {
      queryObj = { _id: id };
    } else if (user.role === 'resort_manager') {
      const managedIds = user.managedResortIds || [];
      queryObj = { _id: id, propertyId: { $in: managedIds } };
    } else {
      queryObj = { _id: id, userId: user.userId };
    }

    const booking = await Booking.findOne(queryObj).lean();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(booking)) });
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

    let queryObj: any = { _id: id };

    if (user.role === 'admin') {
      queryObj = { _id: id };
    } else if (user.role === 'resort_manager') {
      const managedIds = user.managedResortIds || [];
      queryObj = { _id: id, propertyId: { $in: managedIds } };
    } else {
      // Normal users can only cancel their own pending booking
      queryObj = { _id: id, userId: user.userId };
      if (body.status && body.status !== 'cancelled') {
        return NextResponse.json({ error: 'Only administrators and property managers can confirm or reject bookings.' }, { status: 403 });
      }
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      queryObj,
      { $set: body },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(updatedBooking)) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
